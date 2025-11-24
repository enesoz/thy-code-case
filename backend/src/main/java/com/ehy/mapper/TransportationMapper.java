package com.ehy.mapper;

import com.ehy.dto.TransportationRequest;
import com.ehy.dto.TransportationResponse;
import com.ehy.entity.Transportation;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for converting between Transportation entity and DTOs.
 * Provides bidirectional mapping with custom configurations.
 */
@Mapper(componentModel = "spring", uses = {
        LocationMapper.class }, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TransportationMapper {

    /**
     * Convert TransportationRequest to Transportation entity
     * Note: originLocation and destinationLocation must be set separately in the
     * service layer
     * 
     * @param request TransportationRequest DTO
     * @return Transportation entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "originLocation", ignore = true)
    @Mapping(target = "destinationLocation", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "optimisticLockVersion", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "operatingDays", source = "operatingDays", qualifiedByName = "joinOperatingDays")
    Transportation toEntity(TransportationRequest request);

    /**
     * Convert Transportation entity to TransportationResponse
     * 
     * @param transportation Transportation entity
     * @return TransportationResponse DTO
     */
    @Mapping(target = "operatingDays", source = "operatingDays", qualifiedByName = "splitOperatingDays")
    TransportationResponse toResponse(Transportation transportation);

    /**
     * Convert list of Transportation entities to list of TransportationResponse
     * DTOs
     * 
     * @param transportations List of Transportation entities
     * @return List of TransportationResponse DTOs
     */
    List<TransportationResponse> toResponseList(List<Transportation> transportations);

    /**
     * Update existing Transportation entity from TransportationRequest
     * Note: originLocation and destinationLocation must be updated separately in
     * the service layer
     * 
     * @param request        TransportationRequest DTO with updated values
     * @param transportation Existing Transportation entity to update
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "originLocation", ignore = true)
    @Mapping(target = "destinationLocation", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "optimisticLockVersion", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "operatingDays", source = "operatingDays", qualifiedByName = "joinOperatingDays")
    void updateEntityFromRequest(TransportationRequest request, @MappingTarget Transportation transportation);

    @Named("joinOperatingDays")
    default String joinOperatingDays(Integer[] days) {
        if (days == null || days.length == 0)
            return null;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < days.length; i++) {
            if (days[i] == null)
                continue;
            if (sb.length() > 0)
                sb.append(',');
            sb.append(days[i]);
        }
        return sb.toString();
    }

    @Named("splitOperatingDays")
    default Integer[] splitOperatingDays(String days) {
        if (days == null || days.isBlank())
            return new Integer[0];
        String[] tokens = days.split(",");
        Integer[] result = new Integer[tokens.length];
        for (int i = 0; i < tokens.length; i++) {
            try {
                result[i] = Integer.parseInt(tokens[i].trim());
            } catch (NumberFormatException e) {
                result[i] = null;
            }
        }
        return result;
    }
}
