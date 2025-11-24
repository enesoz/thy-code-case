package com.ehy.controller;

import com.ehy.dto.LocationRequest;
import com.ehy.dto.LocationResponse;
import com.ehy.service.LocationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LocationController.class)
@AutoConfigureMockMvc(addFilters = false)
class LocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LocationService locationService;

    @Autowired
    private ObjectMapper objectMapper;

    private LocationRequest locationRequest;
    private LocationResponse locationResponse;
    private UUID locationId;

    @BeforeEach
    void setUp() {
        locationId = UUID.randomUUID();

        locationRequest = new LocationRequest();
        locationRequest.setCountry("Turkey");
        locationRequest.setCity("Istanbul");
        locationRequest.setLocationCode("IST");
        locationRequest.setName("Istanbul Airport");

        locationResponse = LocationResponse.builder()
                .id(locationId)
                .country("Turkey")
                .city("Istanbul")
                .locationCode("IST")
                .name("Istanbul Airport")
                .build();
    }

    @Test
    void getAllLocations_ReturnsList() throws Exception {
        List<LocationResponse> locations = Arrays.asList(locationResponse);
        when(locationService.getAllLocations()).thenReturn(locations);

        mockMvc.perform(get("/api/locations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].locationCode").value("IST"));

        verify(locationService).getAllLocations();
    }

    @Test
    void getLocationById_ReturnsLocation() throws Exception {
        when(locationService.getLocationById(locationId)).thenReturn(locationResponse);

        mockMvc.perform(get("/api/locations/{id}", locationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(locationId.toString()))
                .andExpect(jsonPath("$.locationCode").value("IST"));

        verify(locationService).getLocationById(locationId);
    }

    @Test
    void createLocation_ReturnsCreatedLocation() throws Exception {
        when(locationService.createLocation(any(LocationRequest.class))).thenReturn(locationResponse);

        mockMvc.perform(post("/api/locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.locationCode").value("IST"));

        verify(locationService).createLocation(any(LocationRequest.class));
    }

    @Test
    void updateLocation_ReturnsUpdatedLocation() throws Exception {
        when(locationService.updateLocation(eq(locationId), any(LocationRequest.class))).thenReturn(locationResponse);

        mockMvc.perform(put("/api/locations/{id}", locationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(locationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.locationCode").value("IST"));

        verify(locationService).updateLocation(eq(locationId), any(LocationRequest.class));
    }

    @Test
    void deleteLocation_ReturnsNoContent() throws Exception {
        doNothing().when(locationService).deleteLocation(locationId);

        mockMvc.perform(delete("/api/locations/{id}", locationId))
                .andExpect(status().isNoContent());

        verify(locationService).deleteLocation(locationId);
    }
}
