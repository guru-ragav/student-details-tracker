package com.tracker.exception;

// OOP: Custom Exception for Encapsulation Validation of attendance percentage and records
public class InvalidAttendanceException extends RuntimeException {
    public InvalidAttendanceException(String message) {
        super(message);
    }
}
