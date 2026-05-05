package com.example.demo.chat.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.demo.chat.dto.ApiErrorResponse;

@RestControllerAdvice
public class ChatExceptionHandler {

    @ExceptionHandler(GeminiException.class)
    public ResponseEntity<ApiErrorResponse> handleGeminiException(GeminiException exception) {
        HttpStatusCode status = HttpStatusCode.valueOf(exception.getStatusCode());
        return ResponseEntity.status(status).body(new ApiErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalStateException(IllegalStateException exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(exception.getMessage()));
    }
}
