package com.whiteboard.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorDto {
    private double x;
    private double y;
    private String sessionId;
    private String displayName;
    private String color;
}
