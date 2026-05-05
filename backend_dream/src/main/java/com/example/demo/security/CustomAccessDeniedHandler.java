package com.example.demo.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Devuelve JSON cuando un usuario autenticado no tiene permisos.
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException)
            throws IOException, ServletException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", 403,
                "error", "Forbidden",
                "message", "No tienes permisos para acceder a este recurso.",
                "path", request.getRequestURI()
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
