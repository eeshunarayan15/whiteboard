package com.whiteboard.backend.config;


import com.whiteboard.backend.dto.PresenceDto;
import com.whiteboard.backend.service.SessionRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;

// ─────────────────────────────────────────────────────────────
// Listens to WebSocket lifecycle events:
//   SessionConnectedEvent  → browser opened the WS connection
//   SessionDisconnectEvent → browser closed tab / lost network
//
// On connect: we just log — we don't know the boardId yet.
//   The client tells us which board they're on by subscribing
//   via @SubscribeMapping (see WhiteboardSocketController).
//
// On disconnect: look up which board they were on, remove them
//   from the registry, and broadcast the updated presence list.
// ─────────────────────────────────────────────────────────────
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final SessionRegistry sessionRegistry;

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("WebSocket connected: sessionId={}", accessor.getSessionId());

        // Security hook: extract userId from JWT here
        // String token = accessor.getFirstNativeHeader("Authorization");
        // UUID userId = jwtService.getUserId(token.replace("Bearer ", ""));
        // accessor.getSessionAttributes().put("userId", userId);
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        log.info("WebSocket disconnected: sessionId={}", sessionId);

        // Find which board this session was on and remove them
        String boardId = sessionRegistry.unregister(sessionId);

        if (boardId != null) {
            // Broadcast updated presence list to everyone still on the board
            List<PresenceDto.ParticipantDto> remaining = sessionRegistry.getParticipants(boardId);

            PresenceDto presence = PresenceDto.builder()
                    .action(PresenceDto.Action.LEFT)
                    .sessionId(sessionId)
                    .currentParticipants(remaining)
                    .build();

            messagingTemplate.convertAndSend(
                    "/topic/board/" + boardId + "/presence",
                    presence
            );

            log.info("User {} left board {}. {} participants remaining.",
                    sessionId, boardId, remaining.size());
        }
    }
}