package com.whiteboard.backend.controller;

import com.whiteboard.backend.dto.BoardDto;
import com.whiteboard.backend.service.BoardService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // ── POST /api/boards ──────────────────────────────────────
    // Create a new board
    // Security hook: add Principal parameter when JWT is integrated:
    //   public ResponseEntity<BoardDto.Response> createBoard(
    //       @Valid @RequestBody BoardDto.CreateRequest request,
    //       Principal principal)               ← Spring injects from JWT
    //   { request.setCreatedBy(UUID.fromString(principal.getName())); ... }
    @PostMapping
    public ResponseEntity<BoardDto.Response> createBoard(
            @Valid @RequestBody BoardDto.CreateRequest request) {

        // userId is null until security is plugged in — that's intentional
        BoardDto.Response response = boardService.createBoard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/boards/{boardId} ─────────────────────────────
    // Get board metadata by UUID
    @GetMapping("/{boardId}")
    public ResponseEntity<BoardDto.Response> getBoardById(@PathVariable UUID boardId) {
        return ResponseEntity.ok(boardService.getBoardById(boardId));
    }

    // ── GET /api/boards/join/{shareCode} ──────────────────────
    // Join a board via shareable link code (e.g. /join/abc123)
    @GetMapping("/join/{shareCode}")
    public ResponseEntity<BoardDto.Response> getBoardByShareCode(@PathVariable String shareCode) {
        return ResponseEntity.ok(boardService.getBoardByShareCode(shareCode));
    }
}