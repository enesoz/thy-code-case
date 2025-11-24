package com.ehy.enums;

/**
 * Enumeration representing the types of transportation available in the system.
 * Used to categorize transportation options in route calculation.
 */
public enum TransportationType {
    /**
     * Flight transportation - mandatory in every valid route
     */
    FLIGHT,

    /**
     * Bus transportation - can be used for before-flight or after-flight transfers
     */
    BUS,

    /**
     * Subway/Metro transportation - can be used for before-flight or after-flight transfers
     */
    SUBWAY,

    /**
     * Uber/Taxi transportation - can be used for before-flight or after-flight transfers
     */
    UBER
}
