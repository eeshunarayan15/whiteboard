package com.whiteboard.backend.entity;

import com.whiteboard.backend.enums.EventType;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;

import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "draw_events", indexes = {
    // Fast lookup: "give me all events for board X after version Y"
    @Index(name = "idx_draw_events_board_version", columnList = "board_id, version")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrawEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Which board this event belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    // ── Security hook: who drew this ──────────────────────────
    // When security is integrated, populate from JWT Principal
    // For now nullable — anonymous drawing is fine
    @Column(name = "user_id")
    private UUID userId;

    // Stable ID for the element being created/modified/deleted
    // Client generates this UUID before sending — enables idempotency
    @Column(name = "element_id", nullable = false)
    private UUID elementId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    // The actual drawing data: points, color, shape params, etc.
    // Stored as JSONB — flexible, no schema migration needed for new tools
//    @Type(JsonType.class)
//    @Column(columnDefinition = "jsonb", nullable = false)
//    private Map<String, Object> payload;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> payload;
    // Monotonic counter per board — used for ordering and replay
    // "Give me all events after version 50" → late joiners catch up
    @Column(nullable = false)
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}