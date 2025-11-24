package com.ehy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating a Location.
 * Contains validation constraints for input data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request DTO for creating or updating a location")
public class LocationRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Schema(description = "Name of the location", example = "Istanbul Airport", required = true)
    private String name;

    @NotBlank(message = "Country is required")
    @Size(min = 2, max = 100, message = "Country must be between 2 and 100 characters")
    @Schema(description = "Country where the location is situated", example = "Turkey", required = true)
    private String country;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    @Schema(description = "City where the location is situated", example = "Istanbul", required = true)
    private String city;

    @NotBlank(message = "Location code is required")
    @Pattern(regexp = "^[A-Z0-9]{3,10}$", message = "Location code must be 3-10 uppercase alphanumeric characters")
    @Schema(description = "Unique location code (IATA code or custom)", example = "IST", required = true)
    private String locationCode;

    @Schema(description = "Display order for sorting", example = "1")
    private Integer displayOrder;
}
