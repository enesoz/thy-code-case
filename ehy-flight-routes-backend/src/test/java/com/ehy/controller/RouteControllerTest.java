package com.ehy.controller;

import com.ehy.service.RouteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RouteController.class)
@AutoConfigureMockMvc(addFilters = false)
class RouteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RouteService routeService;

    private UUID originId;
    private UUID destinationId;
    private LocalDate date;

    @BeforeEach
    void setUp() {
        originId = UUID.randomUUID();
        destinationId = UUID.randomUUID();
        date = LocalDate.now();
    }

    @Test
    void searchRoutes_ReturnsList() throws Exception {
        when(routeService.findRoutes(originId, destinationId, date)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/routes/search")
                .param("originId", originId.toString())
                .param("destinationId", destinationId.toString())
                .param("date", date.toString()))
                .andExpect(status().isOk());

        verify(routeService).findRoutes(originId, destinationId, date);
    }
}
