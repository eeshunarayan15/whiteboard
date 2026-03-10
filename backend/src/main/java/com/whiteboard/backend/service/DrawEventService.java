package com.whiteboard.backend.service;


import com.whiteboard.backend.dto.DrawEventDto;
import com.whiteboard.backend.entity.Board;
import com.whiteboard.backend.entity.DrawEvent;
import com.whiteboard.backend.repository.DrawEventRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrawEventService {

    private final DrawEventRepository drawEventRepository;
    private final BoardService boardService;

    // ── Save a new draw event ─────────────────────────────────
    // Called by REST (for now) and later by WebSocket handler
    // userId is null until security is integrated
    @Transactional
    public DrawEventDto.Response saveEvent(UUID boardId, DrawEventDto.CreateRequest request, UUID userId) {
        Board board = boardService.findBoardOrThrow(boardId);

        // Assign the next version atomically
        // This is the single source of truth for event ordering
        Long nextVersion = drawEventRepository.getNextVersion(boardId);

        // If client didn't send an elementId, generate one server-side
        UUID elementId = request.getElementId() != null
                ? request.getElementId()
                : UUID.randomUUID();

        DrawEvent event = DrawEvent.builder()
                .board(board)
                .userId(userId) // null for now — JWT will fill this
                .elementId(elementId)
                .eventType(request.getEventType())
                .payload(request.getPayload())
                .version(nextVersion)
                .build();

        DrawEvent saved = drawEventRepository.save(event);
        return toResponse(saved);
    }

    // ── Full board history — for first page load ──────────────
    @Transactional(readOnly = true)
    public List<DrawEventDto.Response> getAllEvents(UUID boardId) {
        boardService.findBoardOrThrow(boardId); // validate board exists
        return drawEventRepository
                .findByBoardIdOrderByVersionAsc(boardId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Partial history — for reconnect / catch-up ────────────
    // Client says: "I have events up to version 42, give me the rest"
    @Transactional(readOnly = true)
    public List<DrawEventDto.Response> getEventsAfterVersion(UUID boardId, Long fromVersion) {
        boardService.findBoardOrThrow(boardId);
        return drawEventRepository
                .findByBoardIdAndVersionGreaterThanOrderByVersionAsc(boardId, fromVersion)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Map entity → DTO ─────────────────────────────────────
    public DrawEventDto.Response toResponse(DrawEvent event) {
        DrawEventDto.Response response = new DrawEventDto.Response();
        response.setId(event.getId());
        response.setBoardId(event.getBoard().getId());
        response.setElementId(event.getElementId());
        response.setEventType(event.getEventType());
        response.setPayload(event.getPayload());
        response.setVersion(event.getVersion());
        response.setCreatedAt(event.getCreatedAt());
        return response;
    }
}