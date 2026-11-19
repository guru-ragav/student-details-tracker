package com.tracker.report;

import java.util.List;

// OOP: Interface Implementation - Relative Grading Strategy using cohort mean and standard deviation
public class RelativeGrading implements GradingStrategy {

    @Override
    public String getStrategyName() {
        return "Relative Grading";
    }

    @Override
    public String assignGrade(double percentage, List<Double> cohortPercentages) {
        if (percentage < 35.0) {
            return "F";
        }
        if (cohortPercentages == null || cohortPercentages.size() < 2) {
            return new AbsoluteGrading().assignGrade(percentage, cohortPercentages);
        }

        double sum = 0.0;
        for (Double score : cohortPercentages) {
            sum += score;
        }
        double mean = sum / cohortPercentages.size();

        double varianceSum = 0.0;
        for (Double score : cohortPercentages) {
            double diff = score - mean;
            varianceSum += diff * diff;
        }
        double stdDev = Math.sqrt(varianceSum / cohortPercentages.size());
        if (stdDev < 2.0) {
            stdDev = 2.0;
        }

        if (percentage >= mean + 1.5 * stdDev) {
            return "A+";
        } else if (percentage >= mean + 0.75 * stdDev) {
            return "A";
        } else if (percentage >= mean) {
            return "B+";
        } else if (percentage >= mean - 0.75 * stdDev) {
            return "B";
        } else if (percentage >= mean - 1.5 * stdDev) {
            return "C";
        } else {
            return "D";
        }
    }
}
