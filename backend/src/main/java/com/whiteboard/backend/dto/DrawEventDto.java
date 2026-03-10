package com.whiteboard.backend.dto;
import com.whiteboard.backend.enums.EventType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class DrawEventDto {

    @Data
    public static class CreateRequest {
        private UUID elementId;

        @NotNull(message = "Event type is required")
        private EventType eventType;

        @NotNull(message = "Payload is required")
        private Map<String, Object> payload;
    }

    @Data
    public static class Response {
        private UUID id;
        private UUID boardId;
        private UUID elementId;
        private EventType eventType;
        private Map<String, Object> payload;
        private Long version;
        private LocalDateTime createdAt;
    }
}