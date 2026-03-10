package com.whiteboard.backend.controller;

import com.whiteboard.backend.dto.CursorDto;
import com.whiteboard.backend.dto.DrawEventDto;
import com.whiteboard.backend.dto.PresenceDto;
import com.whiteboard.backend.service.DrawEventService;
import com.whiteboard.backend.service.SessionRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

// ─────────────────────────────────────────────────────────────
// STOMP message routing:
//
//  Client SUBSCRIBES to:
//    /topic/board/{boardId}           ← draw events
//    /topic/board/{boardId}/cursors   ← live cursors
//    /topic/board/{boardId}/presence  ← who joined/left
//
//  Client SENDS to:
//    /app/board/{boardId}/subscribe   ← "I'm joining this board"
//    /app/board/{boardId}/draw        ← new draw event
//    /app/board/{boardId}/cursor      ← my cursor moved
// ─────────────────────────────────────────────────────────────
@Controller
@RequiredArgsConstructor
@Slf4j
public class WhiteboardSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final DrawEventService drawEventService;
    private final SessionRegistry sessionRegistry;

    // ── Client joins a board ──────────────────────────────────
    // Called when a user opens the board and subscribes.
    // We register them, then broadcast the updated presence list
    // so everyone's participant panel updates immediately.
    @MessageMapping("/board/{boardId}/subscribe")
    public void handleSubscribe(
            @DestinationVariable String boardId,
            SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();

        // Register this session on the board
        PresenceDto.ParticipantDto participant = sessionRegistry.register(boardId, sessionId);

        log.info("User {} joined board {}", sessionId, boardId);

        // Broadcast to everyone on this board that someone joined
        List<PresenceDto.ParticipantDto> allParticipants = sessionRegistry.getParticipants(boardId);

        PresenceDto presence = PresenceDto.builder()
                .action(PresenceDto.Action.JOINED)
                .sessionId(sessionId)
                .displayName(participant.getDisplayName())
                .color(participant.getColor())
                .currentParticipants(allParticipants)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/board/" + boardId + "/presence",
                presence
        );

        // Security hook: replace null with userId from session attributes:
        // UUID userId = (UUID) headerAccessor.getSessionAttributes().get("userId");
    }

    // ── Client sends a draw event ─────────────────────────────
    // This is the core of the real-time sync.
    // Flow: receive → save to DB → broadcast to all subscribers
    @MessageMapping("/board/{boardId}/draw")
    public void handleDraw(
            @DestinationVariable String boardId,
            @Payload DrawEventDto.CreateRequest request,
            SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();

        // Security hook: get real userId from session attributes
        // UUID userId = (UUID) headerAccessor.getSessionAttributes().get("userId");
        UUID userId = null; // anonymous for now

        try {
            // 1. Save to DB with monotonic version number
            DrawEventDto.Response saved = drawEventService.saveEvent(
                    UUID.fromString(boardId), request, userId
            );

            // 2. Broadcast to every subscriber on this board
            // They receive it and render it on their canvas
            messagingTemplate.convertAndSend(
                    "/topic/board/" + boardId,
                    saved
            );

            log.debug("Draw event broadcast: board={} type={} version={}",
                    boardId, saved.getEventType(), saved.getVersion());

        } catch (Exception e) {
            log.error("Failed to process draw event for board {}: {}", boardId, e.getMessage());

            // Send error back only to the session that caused it
            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/errors",
                    "Failed to save draw event: " + e.getMessage()
            );
        }
    }

    // ── Client sends cursor position ──────────────────────────
    // Ephemeral — NOT saved to DB. Just relayed to other participants.
    // The client should throttle this to ~30ms to avoid flooding.
    @MessageMapping("/board/{boardId}/cursor")
    public void handleCursor(
            @DestinationVariable String boardId,
            @Payload CursorDto cursor,
            SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();

        // Enrich cursor with session info from our registry
        sessionRegistry.getParticipant(boardId, sessionId).ifPresent(participant -> {
            cursor.setSessionId(sessionId);
            cursor.setDisplayName(participant.getDisplayName());
            cursor.setColor(participant.getColor());
        });

        // Broadcast cursor to all other participants
        // Everyone renders a small labeled cursor dot for this user
        messagingTemplate.convertAndSend(
                "/topic/board/" + boardId + "/cursors",
                cursor
        );
    }
    @MessageMapping("/board/{boardId}/segment")
    public void handleSegment(@DestinationVariable String boardId,
                              @Payload Map<String, Object> segment) {
        messagingTemplate.convertAndSend("/topic/board/" + boardId + "/segments", (Object) segment);
    }
}