package com.tracker.report;

import java.util.List;

// OOP: Interface (Strategy Pattern) for interchangeable grading schemes
public interface GradingStrategy {
    String getStrategyName();

    String assignGrade(double percentage, List<Double> cohortPercentages);
}
