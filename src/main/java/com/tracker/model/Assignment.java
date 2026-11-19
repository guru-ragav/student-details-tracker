package com.tracker.model;

import java.time.LocalDate;

// OOP: Inheritance (extends Assessment) & Runtime Polymorphism
public class Assignment extends Assessment {
    private boolean submittedOnTime;
    private double weightage = 0.25;

    public Assignment() {
        super();
    }

    public Assignment(String id, String studentId, String classId, String subject,
                      String title, double maxMarks, double marksObtained,
                      LocalDate assessedDate, boolean submittedOnTime, double weightage) {
        super(id, studentId, classId, subject, title, maxMarks, marksObtained, assessedDate);
        setSubmittedOnTime(submittedOnTime);
        setWeightage(weightage);
    }

    public boolean isSubmittedOnTime() {
        return submittedOnTime;
    }

    public void setSubmittedOnTime(boolean submittedOnTime) {
        this.submittedOnTime = submittedOnTime;
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

    // OOP: Runtime Polymorphism - applies punctuality factor to weighted score
    @Override
    public double calculateWeightedScore() {
        double timelinessFactor = submittedOnTime ? 1.0 : 0.95;
        double weighted = (getMarksObtained() / getMaxMarks()) * 100.0 * weightage * timelinessFactor;
        return Math.round(weighted * 100.0) / 100.0;
    }

    @Override
    public String getAssessmentCategory() {
        return "ASSIGNMENT";
    }
}
