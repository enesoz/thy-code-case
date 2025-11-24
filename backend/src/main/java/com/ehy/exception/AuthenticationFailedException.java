package com.ehy.exception;

/**
 * Exception thrown when authentication fails (invalid credentials).
 * Results in HTTP 401 (Unauthorized) response.
 */
public class AuthenticationFailedException extends RuntimeException {

    public AuthenticationFailedException(String message) {
        super(message);
    }
}
