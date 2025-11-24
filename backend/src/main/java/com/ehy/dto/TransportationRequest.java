package com.ehy.dto;

import com.ehy.enums.TransportationType;
import com.ehy.validation.ValidOperatingDays;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating or updating a Transportation.
 * Contains validation constraints for input data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request DTO for creating or updating a transportation")
public class TransportationRequest {

    @NotNull(message = "Origin location ID is required")
    @Schema(description = "ID of the origin location", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
    private UUID originLocationId;

    @NotNull(message = "Destination location ID is required")
    @Schema(description = "ID of the destination location", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
    private UUID destinationLocationId;

    @NotNull(message = "Transportation type is required")
    @Schema(description = "Type of transportation", example = "FLIGHT", required = true)
    private TransportationType transportationType;

    @NotNull(message = "Operating days are required")
    @ValidOperatingDays
    @Schema(
        description = "Days of week when transportation operates (1=Monday, 2=Tuesday, ..., 7=Sunday). No duplicates allowed.",
        example = "[1, 3, 5, 7]",
        required = true
    )
    private Integer[] operatingDays;
}
