package com.example.demo.chat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class OpenAiClient {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final String responsesUrl;

    public OpenAiClient(
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.model}") String model,
            @Value("${openai.responses-url}") String responsesUrl) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey;
        this.model = model;
        this.responsesUrl = responsesUrl;
    }

    public String generateAnswer(String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Falta configurar la variable de entorno OPENAI_API_KEY.");
        }

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", model,
                    "instructions", "Eres Dream, un asistente claro, util y conciso. Responde siempre en espanol.",
                    "input", List.of(Map.of(
                            "role", "user",
                            "content", userMessage))));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(responsesUrl))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("OpenAI ha devuelto un error " + response.statusCode() + ".");
            }

            return extractAnswer(response.body());
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo preparar o leer la respuesta de OpenAI.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("La llamada a OpenAI fue interrumpida.", exception);
        }
    }

    private String extractAnswer(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode outputText = root.path("output_text");

        if (outputText.isTextual() && !outputText.asText().isBlank()) {
            return outputText.asText();
        }

        JsonNode output = root.path("output");
        if (output.isArray()) {
            for (JsonNode outputItem : output) {
                JsonNode content = outputItem.path("content");
                if (!content.isArray()) {
                    continue;
                }

                for (JsonNode contentItem : content) {
                    JsonNode text = contentItem.path("text");
                    if (text.isTextual() && !text.asText().isBlank()) {
                        return text.asText();
                    }
                }
            }
        }

        throw new IllegalStateException("OpenAI no devolvio texto en la respuesta.");
    }
}
