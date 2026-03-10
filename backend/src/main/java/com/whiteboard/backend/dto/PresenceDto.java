package com.whiteboard.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceDto {

    public enum Action { JOINED, LEFT }

    private Action action;
    private String sessionId;
    private String displayName;
    private String color;
    private List<ParticipantDto> currentParticipants;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantDto {
        private String sessionId;
        private String displayName;
        private String color;
    }
}
