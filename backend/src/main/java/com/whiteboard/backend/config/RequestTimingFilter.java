package com.whiteboard.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class RequestTimingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest http = (HttpServletRequest) request;
        long start = System.currentTimeMillis();

        chain.doFilter(request, response);

        long time = System.currentTimeMillis() - start;

        log.info("API {} {} took {} ms", http.getMethod(), http.getRequestURI(), time);
    }
}
