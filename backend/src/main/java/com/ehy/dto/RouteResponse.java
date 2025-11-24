package com.ehy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * DTO representing a complete route from origin to destination.
 * A route consists of 1-3 segments with exactly one flight.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Complete route from origin to destination")
public class RouteResponse implements Serializable {

    @Schema(description = "List of transportation segments in order (1-3 segments)")
    private List<RouteSegmentResponse> segments;

    @Schema(description = "Total number of segments in the route", example = "2")
    private Integer totalSegments;

    @Schema(description = "Indicates if this route has a before-flight transfer", example = "true")
    private Boolean hasBeforeFlightTransfer;

    @Schema(description = "Indicates if this route has an after-flight transfer", example = "false")
    private Boolean hasAfterFlightTransfer;
}
