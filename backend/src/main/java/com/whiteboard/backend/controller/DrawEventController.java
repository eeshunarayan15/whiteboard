package com.whiteboard.backend.controller;


import com.whiteboard.backend.dto.DrawEventDto;
import com.whiteboard.backend.service.DrawEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards/{boardId}/events")
@RequiredArgsConstructor
public class DrawEventController {

    private final DrawEventService drawEventService;

    // ── GET /api/boards/{boardId}/events ──────────────────────
    // Get ALL events for a board — called when a user first opens a board
    // Optional ?fromVersion=50 — get only events after version 50 (reconnect)
    //
    // Security hook: when JWT is integrated, validate board access here:
    //   boardService.assertCanAccess(boardId, UUID.fromString(principal.getName()));
    @GetMapping
    public ResponseEntity<List<DrawEventDto.Response>> getEvents(
            @PathVariable UUID boardId,
            @RequestParam(required = false) Long fromVersion) {

        List<DrawEventDto.Response> events = fromVersion != null
                ? drawEventService.getEventsAfterVersion(boardId, fromVersion)
                : drawEventService.getAllEvents(boardId);

        return ResponseEntity.ok(events);
    }

    // ── POST /api/boards/{boardId}/events ─────────────────────
    // Save a draw event — used for REST-only testing
    // In production this will be replaced by the WebSocket handler
    // but keeping it here is useful for:
    //   1. Testing with Postman before WebSocket is set up
    //   2. Offline sync — batch upload queued events when reconnecting
    //
    // Security hook: replace null with real userId from Principal:
    //   UUID userId = UUID.fromString(principal.getName());
    @PostMapping
    public ResponseEntity<DrawEventDto.Response> saveEvent(
            @PathVariable UUID boardId,
            @Valid @RequestBody DrawEventDto.CreateRequest request) {

        // userId null = anonymous, fine for now
        DrawEventDto.Response response = drawEventService.saveEvent(boardId, request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}