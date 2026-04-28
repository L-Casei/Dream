package com.example.demo.chat;

import org.springframework.stereotype.Service;

@Service
public class ChatService {

    //Chat Service maneja el mensaje que ha llegado al controlador y llama a GeminiClient

    private final GeminiClient geminiClient;

    public ChatService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    public ChatResponse generateAnswer(ChatRequest request) {
        String message = request == null ? "" : request.message();

        if (message == null || message.isBlank()) {
            return new ChatResponse("Necesito que escribas un mensaje para poder responderte.");
        }

        return new ChatResponse(geminiClient.generateAnswer(message.trim()));
    }
}
