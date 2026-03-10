package com.whiteboard.backend.service;


import com.whiteboard.backend.dto.PresenceDto;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

// ─────────────────────────────────────────────────────────────
// In-memory registry of active WebSocket sessions
//
// Structure:
//   boardId → { sessionId → ParticipantDto }
//
// ConcurrentHashMap because WebSocket events fire on
// multiple threads simultaneously — this keeps it thread-safe.
//
// Note: this lives in memory only. If the server restarts,
// the registry is empty — that's fine because all browsers
// will reconnect and re-register automatically.
//
// Scale hook: swap this for a Redis hash when you need
// multiple server instances to share presence state.
// ─────────────────────────────────────────────────────────────
@Component
public class SessionRegistry {

    // boardId → (sessionId → participant info)
    private final Map<String, Map<String, PresenceDto.ParticipantDto>> boardSessions
            = new ConcurrentHashMap<>();

    // sessionId → boardId (reverse lookup for disconnect events)
    private final Map<String, String> sessionToBoard = new ConcurrentHashMap<>();

    // Pre-defined colors assigned round-robin to participants
    private static final List<String> CURSOR_COLORS = List.of(
            "#ef4444", "#f59e0b", "#10b981", "#3b82f6",
            "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
    );

    // ── Register a new session joining a board ────────────────
    public PresenceDto.ParticipantDto register(String boardId, String sessionId) {
        boardSessions.putIfAbsent(boardId, new ConcurrentHashMap<>());
        Map<String, PresenceDto.ParticipantDto> participants = boardSessions.get(boardId);

        // Assign a color based on how many people are already on this board
        String color = CURSOR_COLORS.get(participants.size() % CURSOR_COLORS.size());
        String displayName = "User #" + sessionId.substring(0, 4).toUpperCase();

        PresenceDto.ParticipantDto participant = PresenceDto.ParticipantDto.builder()
                .sessionId(sessionId)
                .displayName(displayName)
                .color(color)
                .build();

        participants.put(sessionId, participant);
        sessionToBoard.put(sessionId, boardId); // store reverse lookup

        return participant;
    }

    // ── Remove a session (disconnect or leave) ─────────────────
    // Returns the boardId the session was on, or null if not found
    public String unregister(String sessionId) {
        String boardId = sessionToBoard.remove(sessionId);
        if (boardId != null) {
            Map<String, PresenceDto.ParticipantDto> participants = boardSessions.get(boardId);
            if (participants != null) {
                participants.remove(sessionId);
                if (participants.isEmpty()) {
                    boardSessions.remove(boardId); // clean up empty boards
                }
            }
        }
        return boardId;
    }

    // ── Get all participants on a board ───────────────────────
    public List<PresenceDto.ParticipantDto> getParticipants(String boardId) {
        Map<String, PresenceDto.ParticipantDto> participants = boardSessions.get(boardId);
        if (participants == null) return Collections.emptyList();
        return new ArrayList<>(participants.values());
    }

    // ── Get a single participant's info ───────────────────────
    public Optional<PresenceDto.ParticipantDto> getParticipant(String boardId, String sessionId) {
        Map<String, PresenceDto.ParticipantDto> participants = boardSessions.get(boardId);
        if (participants == null) return Optional.empty();
        return Optional.ofNullable(participants.get(sessionId));
    }

    // ── Which board is this session on? ──────────────────────
    public Optional<String> getBoardForSession(String sessionId) {
        return Optional.ofNullable(sessionToBoard.get(sessionId));
    }
}