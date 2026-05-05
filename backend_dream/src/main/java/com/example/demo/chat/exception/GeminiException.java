package com.example.demo.chat.exception;

public class GeminiException extends RuntimeException {

    private final int statusCode;

    public GeminiException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
