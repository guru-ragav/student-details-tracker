package com.tracker.util;

import java.util.regex.Pattern;

// OOP: Utility class with static validation helpers supporting Encapsulation
public final class ValidationUtil {
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private ValidationUtil() {
        // Prevent instantiation
    }

    public static void validateNotBlank(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " must not be empty.");
        }
    }

    public static void validateEmail(String email) {
        validateNotBlank(email, "Email");
        if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Invalid email format: " + email);
        }
    }

    public static void validatePercentage(double percentage, String fieldName) {
        if (Double.isNaN(percentage) || percentage < 0.0 || percentage > 100.0) {
            throw new IllegalArgumentException(fieldName + " must be between 0 and 100.");
        }
    }
}
