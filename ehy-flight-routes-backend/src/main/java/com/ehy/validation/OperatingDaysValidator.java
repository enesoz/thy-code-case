package com.ehy.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Validator implementation for @ValidOperatingDays annotation.
 * Validates operating days array according to business rules.
 */
public class OperatingDaysValidator implements ConstraintValidator<ValidOperatingDays, Integer[]> {

    @Override
    public void initialize(ValidOperatingDays constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(Integer[] operatingDays, ConstraintValidatorContext context) {
        // Null or empty check
        if (operatingDays == null || operatingDays.length == 0) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Operating days cannot be null or empty")
                    .addConstraintViolation();
            return false;
        }

        // Check for null elements
        for (Integer day : operatingDays) {
            if (day == null) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Operating days cannot contain null values")
                        .addConstraintViolation();
                return false;
            }
        }

        // Validate each day is between 1-7
        for (Integer day : operatingDays) {
            if (day < 1 || day > 7) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                                "Invalid operating day: " + day + ". Must be between 1 (Monday) and 7 (Sunday)")
                        .addConstraintViolation();
                return false;
            }
        }

        // Check for duplicates
        Set<Integer> uniqueDays = new HashSet<>(Arrays.asList(operatingDays));
        if (uniqueDays.size() != operatingDays.length) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Operating days cannot contain duplicates")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}
