package com.tracker.model;

import java.time.LocalDate;

// OOP: Inheritance (extends Assessment) & Runtime Polymorphism
public class LabRecord extends Assessment {
    private int experimentsCompleted;
    private double weightage = 0.25;

    public LabRecord() {
        super();
    }

    public LabRecord(String id, String studentId, String classId, String subject,
                     String title, double maxMarks, double marksObtained,
                     LocalDate assessedDate, int experimentsCompleted, double weightage) {
        super(id, studentId, classId, subject, title, maxMarks, marksObtained, assessedDate);
        setExperimentsCompleted(experimentsCompleted);
        setWeightage(weightage);
    }

    public int getExperimentsCompleted() {
        return experimentsCompleted;
    }

    public void setExperimentsCompleted(int experimentsCompleted) {
        if (experimentsCompleted < 0) {
            throw new IllegalArgumentException("Experiments completed cannot be negative.");
        }
        this.experimentsCompleted = experimentsCompleted;
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
        return "LAB_RECORD";
    }
}
