package com.whiteboard.backend.service;
import com.whiteboard.backend.dto.BoardDto;
import com.whiteboard.backend.entity.Board;
import com.whiteboard.backend.repository.BoardRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;

    // ── Create a new board ────────────────────────────────────
    @Transactional
    public BoardDto.Response createBoard(BoardDto.CreateRequest request) {
        Board board = Board.builder()
                .title(request.getTitle())
                .createdBy(request.getCreatedBy()) // null for now; JWT will set this later
                .shareCode(generateShareCode())
                .isPublic(true)
                .build();

        Board saved = boardRepository.save(board);
        return toResponse(saved);
    }

    // ── Get board by its UUID ─────────────────────────────────
    @Transactional(readOnly = true)
    public BoardDto.Response getBoardById(UUID boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("Board not found: " + boardId));
        return toResponse(board);
    }

    // ── Get board by shareable code (e.g. /board/abc123) ─────
    @Transactional(readOnly = true)
    public BoardDto.Response getBoardByShareCode(String shareCode) {
        Board board = boardRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new EntityNotFoundException("Board not found for code: " + shareCode));
        return toResponse(board);
    }

    // ── Security hook ─────────────────────────────────────────
    // When JWT is integrated, add this method:
    //
    // public void assertCanAccess(UUID boardId, UUID userId) {
    //     Board board = findBoardOrThrow(boardId);
    //     if (!board.getIsPublic() && !board.getCreatedBy().equals(userId)) {
    //         throw new AccessDeniedException("You don't have access to this board");
    //     }
    // }

    // ── Internal helper: map entity → DTO ────────────────────
    public BoardDto.Response toResponse(Board board) {
        BoardDto.Response response = new BoardDto.Response();
        response.setId(board.getId());
        response.setTitle(board.getTitle());
        response.setShareCode(board.getShareCode());
        response.setIsPublic(board.getIsPublic());
        response.setCreatedAt(board.getCreatedAt());
        return response;
    }

    // ── Internal helper: find or throw ───────────────────────
    public Board findBoardOrThrow(UUID boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("Board not found: " + boardId));
    }

    // ── Generate a short human-friendly share code ────────────
    private String generateShareCode() {
        // Simple 8-char alphanumeric code — good enough for MVP
        // Could upgrade to NanoID or UUID-based in production
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}