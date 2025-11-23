package com.ehy.controller;

import com.ehy.dto.RouteResponse;
import com.ehy.service.RouteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for RouteController.
 * Tests route search endpoints with Spring Security.
 */
@WebMvcTest(RouteController.class)
@Import(com.ehy.config.SecurityConfig.class)
@DisplayName("RouteController Integration Tests")
class RouteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RouteService routeService;

    @Test
    @DisplayName("GET /api/routes/search - Should return 401 without authentication")
    void shouldReturn401WithoutAuthentication() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/routes/search")
                        .param("originId", UUID.randomUUID().toString())
                        .param("destinationId", UUID.randomUUID().toString())
                        .param("date", "2025-11-23"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/routes/search - Should successfully search routes as ADMIN")
    void shouldSuccessfullySearchRoutesAsAdmin() throws Exception {
        // Given
        UUID originId = UUID.randomUUID();
        UUID destinationId = UUID.randomUUID();
        LocalDate date = LocalDate.of(2025, 11, 23);

        RouteResponse route = RouteResponse.builder()
                .segments(Collections.emptyList())
                .totalSegments(1)
                .hasBeforeFlightTransfer(false)
                .hasAfterFlightTransfer(false)
                .build();

        when(routeService.findRoutes(any(UUID.class), any(UUID.class), any(LocalDate.class)))
                .thenReturn(List.of(route));

        // When & Then
        mockMvc.perform(get("/api/routes/search")
                        .param("originId", originId.toString())
                        .param("destinationId", destinationId.toString())
                        .param("date", "2025-11-23"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].totalSegments").value(1));
    }

    @Test
    @WithMockUser(roles = "AGENCY")
    @DisplayName("GET /api/routes/search - Should successfully search routes as AGENCY")
    void shouldSuccessfullySearchRoutesAsAgency() throws Exception {
        // Given
        UUID originId = UUID.randomUUID();
        UUID destinationId = UUID.randomUUID();

        when(routeService.findRoutes(any(UUID.class), any(UUID.class), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        // When & Then
        mockMvc.perform(get("/api/routes/search")
                        .param("originId", originId.toString())
                        .param("destinationId", destinationId.toString())
                        .param("date", "2025-11-23"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/routes/search - Should return 400 with invalid date format")
    void shouldReturn400WithInvalidDateFormat() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/routes/search")
                        .param("originId", UUID.randomUUID().toString())
                        .param("destinationId", UUID.randomUUID().toString())
                        .param("date", "invalid-date"))
                .andExpect(status().isBadRequest());
    }
}
