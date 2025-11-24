package com.ehy.controller;

import com.ehy.dto.RouteResponse;
import com.ehy.service.RouteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for route search operations.
 * Accessible by users with ADMIN or AGENCY role.
 */
@RestController
@RequestMapping("/api/routes")
@Tag(name = "Routes", description = "Route search endpoints (ADMIN and AGENCY)")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAnyRole('ADMIN', 'AGENCY')")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    /**
     * Search for routes between origin and destination on a specific date
     * @param originId Origin location ID
     * @param destinationId Destination location ID
     * @param date Travel date (yyyy-MM-dd)
     * @return List of valid routes
     */
    @GetMapping("/search")
    @Operation(
            summary = "Search routes",
            description = """
                    Find all valid routes from origin to destination on a specific date.

                    **Route Rules:**
                    - Maximum 3 segments per route
                    - Exactly 1 flight segment (mandatory)
                    - Optional before-flight transfer (0-1 ground transport)
                    - Optional after-flight transfer (0-1 ground transport)
                    - All segments must operate on the selected date
                    - Segments must be connected (arrival location = next departure location)

                    **Valid Route Examples:**
                    - FLIGHT
                    - UBER → FLIGHT
                    - FLIGHT → BUS
                    - SUBWAY → FLIGHT → UBER

                    **Caching:**
                    Results are cached with Redis for 1 hour to improve performance.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved routes (may be empty if no valid routes found)",
                    content = @Content(schema = @Schema(implementation = RouteResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request parameters"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Origin or destination location not found"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - ADMIN or AGENCY role required"
            )
    })
    public ResponseEntity<List<RouteResponse>> searchRoutes(
            @Parameter(description = "Origin location ID", required = true, example = "550e8400-e29b-41d4-a716-446655440000")
            @RequestParam UUID originId,

            @Parameter(description = "Destination location ID", required = true, example = "550e8400-e29b-41d4-a716-446655440001")
            @RequestParam UUID destinationId,

            @Parameter(description = "Travel date (yyyy-MM-dd)", required = true, example = "2025-11-23")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<RouteResponse> routes = routeService.findRoutes(originId, destinationId, date);
        return ResponseEntity.ok(routes);
    }
}
