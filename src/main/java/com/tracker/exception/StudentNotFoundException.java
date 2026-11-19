package com.tracker.exception;

// OOP: Custom Exception for missing student records
public class StudentNotFoundException extends RuntimeException {
    private final String studentId;

    public StudentNotFoundException(String studentId) {
        super("Student not found with ID: " + studentId);
        this.studentId = studentId;
    }

    public String getStudentId() {
        return studentId;
    }
}
