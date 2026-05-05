package com.example.demo.chat.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.chat.exception.ChatFileException;

@Service
public class ChatFileService {

    private static final int MAX_FILES = 5;
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;
    private static final long MAX_TOTAL_SIZE_BYTES = 25L * 1024L * 1024L;
    private static final int MAX_EXTRACTED_CHARS_PER_FILE = 24_000;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "txt", "md", "csv", "json", "png", "jpg", "jpeg", "webp");
    private static final Set<String> TEXT_EXTENSIONS = Set.of("txt", "md", "csv", "json");
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp");

    public String buildPromptWithFiles(String message, List<MultipartFile> files) {
        validateFiles(files);

        if (files.isEmpty()) {
            return message;
        }

        StringBuilder prompt = new StringBuilder();

        if (message != null && !message.isBlank()) {
            prompt.append(message.trim()).append("\n\n");
        }

        prompt.append("El usuario ha adjuntado ").append(files.size()).append(" archivo(s). ");
        prompt.append("Usa el contenido extraido cuando sea relevante. ");
        prompt.append("Si un archivo no tiene contenido textual disponible, indicalo con claridad.\n\n");

        for (MultipartFile file : files) {
            appendFileContent(prompt, file);
        }

        return prompt.toString().trim();
    }

    private void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }

        if (files.size() > MAX_FILES) {
            throw new ChatFileException("Puedes adjuntar como maximo " + MAX_FILES + " archivos por mensaje.");
        }

        long totalSize = 0L;

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                throw new ChatFileException("Uno de los archivos adjuntos esta vacio.");
            }

            String extension = getExtension(file.getOriginalFilename());

            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new ChatFileException("Formato no permitido: " + safeFileName(file));
            }

            if (file.getSize() > MAX_FILE_SIZE_BYTES) {
                throw new ChatFileException("El archivo " + safeFileName(file) + " supera el limite de 10 MB.");
            }

            totalSize += file.getSize();
        }

        if (totalSize > MAX_TOTAL_SIZE_BYTES) {
            throw new ChatFileException("El mensaje supera el limite total de 25 MB en adjuntos.");
        }
    }

    private void appendFileContent(StringBuilder prompt, MultipartFile file) {
        String fileName = safeFileName(file);
        String extension = getExtension(file.getOriginalFilename());
        String contentType = file.getContentType() == null ? "desconocido" : file.getContentType();

        prompt.append("Archivo: ").append(fileName).append("\n");
        prompt.append("Tipo: ").append(contentType).append("\n");
        prompt.append("Tamaño: ").append(file.getSize()).append(" bytes\n");

        if (TEXT_EXTENSIONS.contains(extension)) {
            prompt.append("Contenido extraido:\n");
            prompt.append(truncate(readTextFile(file))).append("\n\n");
            return;
        }

        if ("pdf".equals(extension)) {
            prompt.append("Contenido extraido del PDF:\n");
            prompt.append(truncate(readPdfFile(file))).append("\n\n");
            return;
        }

        if (IMAGE_EXTENSIONS.contains(extension)) {
            prompt.append("Contenido extraido: imagen adjunta sin analisis visual en esta fase.\n\n");
        }
    }

    private String readTextFile(MultipartFile file) {
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new ChatFileException("No se pudo leer el archivo " + safeFileName(file) + ".");
        }
    }

    private String readPdfFile(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(document);
        } catch (IOException exception) {
            throw new ChatFileException("No se pudo extraer texto del PDF " + safeFileName(file) + ".");
        }
    }

    private String truncate(String content) {
        if (content == null || content.isBlank()) {
            return "[Sin texto extraible]";
        }

        String normalizedContent = content.trim();

        if (normalizedContent.length() <= MAX_EXTRACTED_CHARS_PER_FILE) {
            return normalizedContent;
        }

        return normalizedContent.substring(0, MAX_EXTRACTED_CHARS_PER_FILE)
                + "\n\n[Contenido truncado por limite de tamaño]";
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }

        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private String safeFileName(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        return fileName == null || fileName.isBlank() ? "archivo" : fileName;
    }
}
