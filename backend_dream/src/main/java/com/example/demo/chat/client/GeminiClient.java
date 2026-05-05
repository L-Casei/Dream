package com.example.demo.chat.client;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.demo.chat.exception.GeminiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class GeminiClient {

    private static final String SYSTEM_INSTRUCTION = """
            Eres Dream, un asistente claro, util y conciso. Responde siempre en espanol.

            Reglas de presentacion:
            - Usa Markdown cuando mejore la lectura.
            - Para explicaciones largas, separa por titulos cortos con #, ## o ###.
            - Para pasos, comparaciones o elementos relacionados, usa listas con guiones.
            - Para codigo, usa bloques con triple backtick e indica el lenguaje cuando lo conozcas.
            - Para comandos de terminal, usa bloques de codigo con bash, powershell o el shell adecuado.
            - Para formulas u operaciones matematicas importantes, usa bloques LaTeX con $$...$$ y deja espacios legibles.
            - Para resultados, conclusiones o valores finales, usa **negrita** con moderacion.
            - Para nombres de variables, rutas, comandos cortos o identificadores, usa `codigo inline`.
            - No uses HTML.
            - No fuerces formato si la respuesta es muy corta o conversacional.
            """;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public GeminiClient(
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model}") String model,
            @Value("${gemini.base-url}") String baseUrl) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
    }

    public String generateAnswer(String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Falta configurar la variable de entorno GEMINI_API_KEY.");
        }

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "systemInstruction", Map.of(
                            "parts", List.of(Map.of(
                                    "text", SYSTEM_INSTRUCTION))),
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of(
                                    "text", userMessage))))));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(buildGenerateContentUri())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new GeminiException(response.statusCode(), buildErrorMessage(response.statusCode(), response.body()));
            }

            return extractAnswer(response.body());
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo preparar o leer la respuesta de Gemini.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("La llamada a Gemini fue interrumpida.", exception);
        }
    }

    private URI buildGenerateContentUri() {
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String encodedModel = URLEncoder.encode(model, StandardCharsets.UTF_8);
        String encodedApiKey = URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
        return URI.create(normalizedBaseUrl + "/models/" + encodedModel + ":generateContent?key=" + encodedApiKey);
    }

    private String buildErrorMessage(int statusCode, String responseBody) {
        if (statusCode == 429) {
            return "Gemini ha limitado la peticion. Revisa la cuota, el limite de uso o espera antes de intentarlo de nuevo.";
        }

        String geminiMessage = extractGeminiErrorMessage(responseBody);
        if (geminiMessage == null || geminiMessage.isBlank()) {
            return "Gemini ha devuelto un error " + statusCode + ".";
        }

        return "Gemini ha devuelto un error " + statusCode + ": " + geminiMessage;
    }

    private String extractGeminiErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "";
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode message = root.path("error").path("message");
            return message.isTextual() ? message.asText() : "";
        } catch (IOException exception) {
            return "";
        }
    }

    private String extractAnswer(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.path("candidates");

        if (candidates.isArray()) {
            StringBuilder answer = new StringBuilder();
            for (JsonNode candidate : candidates) {
                JsonNode parts = candidate.path("content").path("parts");
                if (!parts.isArray()) {
                    continue;
                }

                for (JsonNode part : parts) {
                    JsonNode text = part.path("text");
                    if (text.isTextual() && !text.asText().isBlank()) {
                        answer.append(text.asText());
                    }
                }
            }

            if (!answer.isEmpty()) {
                return answer.toString();
            }
        }

        throw new IllegalStateException("Gemini no devolvio texto en la respuesta.");
    }
}
