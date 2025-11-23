package com.ehy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for Location response.
 * Contains all location information to be sent to the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO containing location information")
public class LocationResponse {

    @Schema(description = "Unique identifier of the location", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Name of the location", example = "Istanbul Airport")
    private String name;

    @Schema(description = "Country where the location is situated", example = "Turkey")
    private String country;

    @Schema(description = "City where the location is situated", example = "Istanbul")
    private String city;

    @Schema(description = "Unique location code (IATA code or custom)", example = "IST")
    private String locationCode;

    @Schema(description = "Display order for sorting", example = "1")
    private Integer displayOrder;
}
