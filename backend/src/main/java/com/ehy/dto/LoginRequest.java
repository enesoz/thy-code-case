package com.ehy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user login request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request DTO for user login")
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Schema(description = "Username for authentication", example = "admin", required = true)
    private String username;

    @NotBlank(message = "Password is required")
    @Schema(description = "Password for authentication", example = "admin123", required = true)
    private String password;
}
