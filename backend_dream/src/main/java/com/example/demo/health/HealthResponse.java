package com.example.demo.health;

import java.time.LocalDateTime;

public class HealthResponse {
    private String status;
    private LocalDateTime timestamp;
    private String message;

    public HealthResponse(String status, String message) {
        this.status = status;
        this.timestamp = LocalDateTime.now();
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
