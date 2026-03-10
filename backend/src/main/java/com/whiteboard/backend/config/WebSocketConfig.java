package com.whiteboard.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Server → Client: topics the client can subscribe to
        // /topic/board/{boardId}         → draw events for a board
        // /topic/board/{boardId}/cursors → live cursor positions
        // /topic/board/{boardId}/presence→ who joined/left
        // /user/queue/errors             → personal error messages
        registry.enableSimpleBroker("/topic", "/queue");

        // Client → Server: prefix for @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");

        // Enables /user/queue/... for sending to a specific session
        registry.setUserDestinationPrefix("/user");

        // Security hook: swap enableSimpleBroker for a Redis relay
        // when you need to scale to multiple server instances:
        // registry.enableStompBrokerRelay("/topic", "/queue")
        //     .setRelayHost("localhost")
        //     .setRelayPort(6379);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // lock down in prod via allowed-origins
                .withSockJS();                   // SockJS fallback for older browsers

        // Security hook: add JWT handshake interceptor here:
        // registry.addEndpoint("/ws")
        //     .addInterceptors(new JwtHandshakeInterceptor())
        //     .withSockJS();
    }
}