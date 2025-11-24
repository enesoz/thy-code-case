package com.ehy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for error responses.
 * Provides consistent error information structure across the API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Error response DTO")
public class ErrorResponse {

    @Schema(description = "Timestamp when the error occurred", example = "2025-11-23T10:30:00")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Schema(description = "HTTP status code", example = "400")
    private Integer status;

    @Schema(description = "Error type or category", example = "BAD_REQUEST")
    private String error;

    @Schema(description = "Error message", example = "Invalid input data")
    private String message;

    @Schema(description = "API path where the error occurred", example = "/api/locations")
    private String path;

    @Schema(description = "List of validation errors (if applicable)")
    private List<ValidationError> validationErrors;

    /**
     * Nested DTO for field-level validation errors
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Field validation error")
    public static class ValidationError {

        @Schema(description = "Field name that failed validation", example = "locationCode")
        private String field;

        @Schema(description = "Validation error message", example = "Location code must be 3-10 uppercase alphanumeric characters")
        private String message;
    }
}
