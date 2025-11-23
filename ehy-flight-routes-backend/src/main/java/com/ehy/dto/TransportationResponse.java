package com.ehy.dto;

import com.ehy.enums.TransportationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for Transportation response.
 * Contains all transportation information to be sent to the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO containing transportation information")
public class TransportationResponse {

    @Schema(description = "Unique identifier of the transportation", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Origin location information")
    private LocationResponse originLocation;

    @Schema(description = "Destination location information")
    private LocationResponse destinationLocation;

    @Schema(description = "Type of transportation", example = "FLIGHT")
    private TransportationType transportationType;

    @Schema(description = "Days of week when transportation operates (1=Monday, ..., 7=Sunday)", example = "[1, 3, 5, 7]")
    private Integer[] operatingDays;
}
