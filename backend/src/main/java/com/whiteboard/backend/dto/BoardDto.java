package com.whiteboard.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class BoardDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Board title is required")
        private String title;
        private UUID createdBy;
    }

    @Data
    public static class Response {
        private UUID id;
        private String title;
        private String shareCode;
        private Boolean isPublic;
        private LocalDateTime createdAt;
    }
}