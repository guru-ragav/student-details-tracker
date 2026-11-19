package com.tracker.exception;

// OOP: Custom Exception for JSON persistence failures
public class DataPersistenceException extends RuntimeException {
    public DataPersistenceException(String message, Throwable cause) {
        super(message, cause);
    }
}
