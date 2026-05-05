package com.example.demo.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Devuelve JSON cuando un usuario intenta acceder sin autenticarse.
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", 401,
                "error", "Unauthorized",
                "message", "Debes iniciar sesion para acceder a este recurso.",
                "path", request.getRequestURI()
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
