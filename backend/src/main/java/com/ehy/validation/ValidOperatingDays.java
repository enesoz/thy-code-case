package com.ehy.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for operating days array.
 * Validates that:
 * - Array is not null or empty
 * - All days are between 1 (Monday) and 7 (Sunday)
 * - No duplicate days exist
 *
 * Usage example:
 * <pre>
 * public class TransportationRequest {
 *     @ValidOperatingDays
 *     private Integer[] operatingDays;
 * }
 * </pre>
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = OperatingDaysValidator.class)
@Documented
public @interface ValidOperatingDays {

    /**
     * Default validation error message
     * @return error message
     */
    String message() default "Invalid operating days. Days must be between 1 (Monday) and 7 (Sunday), with no duplicates";

    /**
     * Validation groups
     * @return groups
     */
    Class<?>[] groups() default {};

    /**
     * Payload
     * @return payload
     */
    Class<? extends Payload>[] payload() default {};
}
