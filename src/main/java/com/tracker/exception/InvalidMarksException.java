package com.tracker.exception;

// OOP: Custom Checked/Runtime Exception for Encapsulation Validation
public class InvalidMarksException extends RuntimeException {
    private final double attemptedMarks;
    private final double maxAllowedMarks;

    public InvalidMarksException(String message) {
        super(message);
        this.attemptedMarks = -1;
        this.maxAllowedMarks = -1;
    }

    public InvalidMarksException(double attemptedMarks, double maxAllowedMarks) {
        super(String.format("Invalid marks %.2f: marks must be between 0 and %.2f.", attemptedMarks, maxAllowedMarks));
        this.attemptedMarks = attemptedMarks;
        this.maxAllowedMarks = maxAllowedMarks;
    }

    public double getAttemptedMarks() {
        return attemptedMarks;
    }

    public double getMaxAllowedMarks() {
        return maxAllowedMarks;
    }
}
