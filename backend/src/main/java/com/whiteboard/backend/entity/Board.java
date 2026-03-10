package com.whiteboard.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "boards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    // ── Security hook: who created this board ─────────────────
    // When security is integrated, populate this from JWT Principal
    // For now it's nullable — any anonymous user can create a board
    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "share_code", unique = true, nullable = false)
    private String shareCode; // short code for shareable links e.g. "abc123"

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true; // open by default; flip to false when auth is ready

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}