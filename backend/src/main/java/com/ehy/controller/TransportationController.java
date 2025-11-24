package com.ehy.controller;

import com.ehy.dto.TransportationRequest;
import com.ehy.dto.TransportationResponse;
import com.ehy.service.TransportationService;
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
 * REST controller for transportation management.
 * Only accessible by users with ADMIN role.
 */
@RestController
@RequestMapping("/api/transportations")
@Tag(name = "Transportations", description = "Transportation management endpoints (ADMIN only)")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class TransportationController {

    private final TransportationService transportationService;

    public TransportationController(TransportationService transportationService) {
        this.transportationService = transportationService;
    }

    /**
     * Get all transportations
     * @return List of transportations
     */
    @GetMapping
    @Operation(summary = "Get all transportations", description = "Retrieve all non-deleted transportations")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved transportations"
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
    public ResponseEntity<List<TransportationResponse>> getAllTransportations() {
        List<TransportationResponse> transportations = transportationService.getAllTransportations();
        return ResponseEntity.ok(transportations);
    }

    /**
     * Get transportation by ID
     * @param id Transportation ID
     * @return Transportation details
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get transportation by ID", description = "Retrieve a specific transportation by its ID")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved transportation",
                    content = @Content(schema = @Schema(implementation = TransportationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Transportation not found"
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
    public ResponseEntity<TransportationResponse> getTransportationById(@PathVariable UUID id) {
        TransportationResponse transportation = transportationService.getTransportationById(id);
        return ResponseEntity.ok(transportation);
    }

    /**
     * Create a new transportation
     * @param request Transportation creation request
     * @return Created transportation
     */
    @PostMapping
    @Operation(summary = "Create transportation", description = "Create a new transportation")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Transportation created successfully",
                    content = @Content(schema = @Schema(implementation = TransportationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
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
                    description = "Forbidden - ADMIN role required"
            )
    })
    public ResponseEntity<TransportationResponse> createTransportation(
            @Valid @RequestBody TransportationRequest request) {
        TransportationResponse transportation = transportationService.createTransportation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transportation);
    }

    /**
     * Update an existing transportation
     * @param id Transportation ID
     * @param request Transportation update request
     * @return Updated transportation
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update transportation", description = "Update an existing transportation")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Transportation updated successfully",
                    content = @Content(schema = @Schema(implementation = TransportationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Transportation, origin, or destination location not found"
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
    public ResponseEntity<TransportationResponse> updateTransportation(
            @PathVariable UUID id,
            @Valid @RequestBody TransportationRequest request) {
        TransportationResponse transportation = transportationService.updateTransportation(id, request);
        return ResponseEntity.ok(transportation);
    }

    /**
     * Delete a transportation (soft delete)
     * @param id Transportation ID
     * @return No content
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transportation", description = "Soft delete a transportation")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Transportation deleted successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Transportation not found"
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
    public ResponseEntity<Void> deleteTransportation(@PathVariable UUID id) {
        transportationService.deleteTransportation(id);
        return ResponseEntity.noContent().build();
    }
}
