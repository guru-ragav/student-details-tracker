package com.tracker.report;

import java.util.List;

// OOP: Interface Implementation - Absolute Grading Strategy
public class AbsoluteGrading implements GradingStrategy {

    @Override
    public String getStrategyName() {
        return "Absolute Grading";
    }

    @Override
    public String assignGrade(double percentage, List<Double> cohortPercentages) {
        if (percentage >= 90.0) {
            return "A+";
        } else if (percentage >= 80.0) {
            return "A";
        } else if (percentage >= 70.0) {
            return "B+";
        } else if (percentage >= 60.0) {
            return "B";
        } else if (percentage >= 50.0) {
            return "C";
        } else if (percentage >= 40.0) {
            return "D";
        } else {
            return "F";
        }
    }
}
