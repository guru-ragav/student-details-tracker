package com.tracker.model;

import java.time.LocalDate;

// OOP: Inheritance (extends Assessment) & Runtime Polymorphism
public class InternalTest extends Assessment {
    private int testNumber;
    private double weightage = 0.50;

    public InternalTest() {
        super();
    }

    public InternalTest(String id, String studentId, String classId, String subject,
                        String title, double maxMarks, double marksObtained,
                        LocalDate assessedDate, int testNumber, double weightage) {
        super(id, studentId, classId, subject, title, maxMarks, marksObtained, assessedDate);
        setTestNumber(testNumber);
        setWeightage(weightage);
    }

    public int getTestNumber() {
        return testNumber;
    }

    public void setTestNumber(int testNumber) {
        if (testNumber < 1) {
            throw new IllegalArgumentException("Test number must be at least 1.");
        }
        this.testNumber = testNumber;
    }

    public double getWeightage() {
        return weightage;
    }

    public void setWeightage(double weightage) {
        if (weightage <= 0.0 || weightage > 1.0) {
            throw new IllegalArgumentException("Weightage must be between 0 and 1.");
        }
        this.weightage = weightage;
    }

    // OOP: Runtime Polymorphism - overrides Assessment.calculateWeightedScore()
    @Override
    public double calculateWeightedScore() {
        double weighted = (getMarksObtained() / getMaxMarks()) * 100.0 * weightage;
        return Math.round(weighted * 100.0) / 100.0;
    }

    @Override
    public String getAssessmentCategory() {
        return "INTERNAL_TEST";
    }
}
