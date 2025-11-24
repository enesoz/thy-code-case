package com.ehy.mapper;

import com.ehy.dto.LocationRequest;
import com.ehy.dto.LocationResponse;
import com.ehy.entity.Location;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for converting between Location entity and DTOs.
 * Provides bidirectional mapping with custom configurations.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LocationMapper {

    /**
     * Convert LocationRequest to Location entity
     * 
     * @param request LocationRequest DTO
     * @return Location entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "optimisticLockVersion", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Location toEntity(LocationRequest request);

    /**
     * Convert Location entity to LocationResponse
     * 
     * @param location Location entity
     * @return LocationResponse DTO
     */
    LocationResponse toResponse(Location location);

    /**
     * Convert list of Location entities to list of LocationResponse DTOs
     * 
     * @param locations List of Location entities
     * @return List of LocationResponse DTOs
     */
    List<LocationResponse> toResponseList(List<Location> locations);

    /**
     * Update existing Location entity from LocationRequest
     * 
     * @param request  LocationRequest DTO with updated values
     * @param location Existing Location entity to update
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "optimisticLockVersion", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(LocationRequest request, @MappingTarget Location location);
}
