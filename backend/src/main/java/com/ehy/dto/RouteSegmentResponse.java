package com.ehy.dto;

import com.ehy.enums.TransportationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO representing a single segment in a route.
 * A segment is a single transportation from one location to another.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "A single transportation segment in a route")
public class RouteSegmentResponse {

    @Schema(description = "Unique identifier of the transportation", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID transportationId;

    @Schema(description = "Origin location information")
    private LocationResponse originLocation;

    @Schema(description = "Destination location information")
    private LocationResponse destinationLocation;

    @Schema(description = "Type of transportation", example = "FLIGHT")
    private TransportationType transportationType;

    @Schema(description = "Segment order in the route (1-based)", example = "1")
    private Integer segmentOrder;
}
