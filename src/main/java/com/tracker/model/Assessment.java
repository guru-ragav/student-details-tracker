package com.tracker.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.tracker.exception.InvalidMarksException;
import com.tracker.util.ValidationUtil;

import java.time.LocalDate;

// OOP: Inheritance (Abstract Base Class) & Encapsulation
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "assessmentType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = InternalTest.class, name = "INTERNAL_TEST"),
        @JsonSubTypes.Type(value = Assignment.class, name = "ASSIGNMENT"),
        @JsonSubTypes.Type(value = LabRecord.class, name = "LAB_RECORD")
})
public abstract class Assessment {
    // OOP: Encapsulation - all fields private
    private String id;
    private String studentId;
    private String classId;
    private String subject;
    private String title;
    private double maxMarks = 100.0;
    private double marksObtained;
    private LocalDate assessedDate;
    private boolean verifiedByExamCell;
    private String verifiedBy = "";

    protected Assessment() {
    }

    protected Assessment(String id, String studentId, String classId, String subject,
                         String title, double maxMarks, double marksObtained, LocalDate assessedDate) {
        setId(id);
        setStudentId(studentId);
        setClassId(classId);
        setSubject(subject);
        setTitle(title);
        setMaxMarks(maxMarks);
        setMarksObtained(marksObtained);
        setAssessedDate(assessedDate);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        ValidationUtil.validateNotBlank(id, "Assessment ID");
        this.id = id.trim();
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        ValidationUtil.validateNotBlank(studentId, "Student ID");
        this.studentId = studentId.trim();
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        ValidationUtil.validateNotBlank(classId, "Class ID");
        this.classId = classId.trim();
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        ValidationUtil.validateNotBlank(subject, "Subject");
        this.subject = subject.trim();
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        ValidationUtil.validateNotBlank(title, "Assessment Title");
        this.title = title.trim();
    }

    public double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(double maxMarks) {
        if (Double.isNaN(maxMarks) || maxMarks <= 0.0) {
            throw new InvalidMarksException("Maximum marks must be greater than 0.");
        }
        this.maxMarks = maxMarks;
    }

    public double getMarksObtained() {
        return marksObtained;
    }

    // OOP: Encapsulation - validates marks 0..maxMarks and throws custom exception
    public void setMarksObtained(double marksObtained) {
        if (Double.isNaN(marksObtained) || marksObtained < 0.0 || marksObtained > this.maxMarks) {
            throw new InvalidMarksException(marksObtained, this.maxMarks);
        }
        this.marksObtained = Math.round(marksObtained * 100.0) / 100.0;
    }

    public LocalDate getAssessedDate() {
        return assessedDate;
    }

    public void setAssessedDate(LocalDate assessedDate) {
        this.assessedDate = assessedDate == null ? LocalDate.now() : assessedDate;
    }

    public boolean isVerifiedByExamCell() {
        return verifiedByExamCell;
    }

    public void setVerifiedByExamCell(boolean verifiedByExamCell) {
        this.verifiedByExamCell = verifiedByExamCell;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy == null ? "" : verifiedBy.trim();
    }

    public double getPercentageScore() {
        return Math.round((marksObtained / maxMarks) * 10000.0) / 100.0;
    }

    public double getWeightedScore() {
        return calculateWeightedScore();
    }

    // OOP: Runtime Polymorphism - overridden by InternalTest, Assignment, LabRecord
    public abstract double calculateWeightedScore();

    public abstract String getAssessmentCategory();
}
