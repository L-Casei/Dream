package com.example.demo.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.chat.client.GeminiClient;
import com.example.demo.chat.dto.ChatRequest;
import com.example.demo.chat.dto.ChatResponse;

@Service
public class ChatService {

    private final GeminiClient geminiClient;
    private final ChatFileService chatFileService;

    public ChatService(GeminiClient geminiClient, ChatFileService chatFileService) {
        this.geminiClient = geminiClient;
        this.chatFileService = chatFileService;
    }

    public ChatResponse generateAnswer(ChatRequest request) {
        String message = request == null ? "" : request.message();
        return generateAnswer(message, List.of());
    }

    public ChatResponse generateAnswer(String message, List<MultipartFile> files) {
        String normalizedMessage = message == null ? "" : message.trim();
        List<MultipartFile> safeFiles = files == null ? List.of() : files;

        if (normalizedMessage.isBlank() && safeFiles.isEmpty()) {
            return new ChatResponse("Necesito que escribas un mensaje o adjuntes un archivo para poder responderte.");
        }

        String prompt = chatFileService.buildPromptWithFiles(normalizedMessage, safeFiles);
        return new ChatResponse(geminiClient.generateAnswer(prompt));
    }
}
