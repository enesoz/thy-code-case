package com.ehy.controller;

import com.ehy.dto.LocationRequest;
import com.ehy.dto.LocationResponse;
import com.ehy.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for location management.
 * GET operations accessible by ADMIN and AGENCY roles.
 * POST/PUT/DELETE operations accessible by ADMIN role only.
 */
@RestController
@RequestMapping("/api/locations")
@Tag(name = "Locations", description = "Location management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    /**
     * Get all locations
     * @return List of locations
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENCY')")
    @Operation(summary = "Get all locations", description = "Retrieve all non-deleted locations")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved locations"
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
    public ResponseEntity<List<LocationResponse>> getAllLocations() {
        List<LocationResponse> locations = locationService.getAllLocations();
        return ResponseEntity.ok(locations);
    }

    /**
     * Get location by ID
     * @param id Location ID
     * @return Location details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENCY')")
    @Operation(summary = "Get location by ID", description = "Retrieve a specific location by its ID")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved location",
                    content = @Content(schema = @Schema(implementation = LocationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Location not found"
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
    public ResponseEntity<LocationResponse> getLocationById(@PathVariable UUID id) {
        LocationResponse location = locationService.getLocationById(id);
        return ResponseEntity.ok(location);
    }

    /**
     * Create a new location
     * @param request Location creation request
     * @return Created location
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create location", description = "Create a new location")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Location created successfully",
                    content = @Content(schema = @Schema(implementation = LocationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Location code already exists"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - ADMIN role required"
            )
    })
    public ResponseEntity<LocationResponse> createLocation(@Valid @RequestBody LocationRequest request) {
        LocationResponse location = locationService.createLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(location);
    }

    /**
     * Update an existing location
     * @param id Location ID
     * @param request Location update request
     * @return Updated location
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update location", description = "Update an existing location")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Location updated successfully",
                    content = @Content(schema = @Schema(implementation = LocationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Location not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Location code already exists"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - ADMIN role required"
            )
    })
    public ResponseEntity<LocationResponse> updateLocation(
            @PathVariable UUID id,
            @Valid @RequestBody LocationRequest request) {
        LocationResponse location = locationService.updateLocation(id, request);
        return ResponseEntity.ok(location);
    }

    /**
     * Delete a location (soft delete)
     * @param id Location ID
     * @return No content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete location", description = "Soft delete a location")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Location deleted successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Location not found"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - ADMIN role required"
            )
    })
    public ResponseEntity<Void> deleteLocation(@PathVariable UUID id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }
}
