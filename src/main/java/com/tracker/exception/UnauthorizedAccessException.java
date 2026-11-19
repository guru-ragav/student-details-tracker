package com.tracker.exception;

// OOP: Custom Exception for role-based access and login validation
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
