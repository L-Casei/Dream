package com.example.demo.chat.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

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

    @ExceptionHandler(ChatFileException.class)
    public ResponseEntity<ApiErrorResponse> handleChatFileException(ChatFileException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSizeExceededException() {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE)
                .body(new ApiErrorResponse("El archivo o el conjunto de archivos supera el limite permitido."));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingServletRequestPartException(MissingServletRequestPartException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse("Falta una parte requerida del formulario: " + exception.getRequestPartName()));
    }
}
