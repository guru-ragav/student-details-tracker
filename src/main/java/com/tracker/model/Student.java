package com.tracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tracker.exception.InvalidAttendanceException;
import com.tracker.report.AbsoluteGrading;
import com.tracker.report.GradingStrategy;
import com.tracker.util.ValidationUtil;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// OOP: Inheritance (extends Person) & Interfaces (implements Gradable, Trackable)
public class Student extends Person implements Gradable, Trackable {
    public static final double MINIMUM_REQUIRED_ATTENDANCE = 75.0;

    // OOP: Encapsulation - private fields with validated setters
    private String rollNumber;
    private String departmentId;
    private String classId;
    private int semester;
    private double attendancePercentage;
    private double academicPercentage;

    @JsonIgnore
    private transient List<Double> cohortPercentages = new ArrayList<>();

    @JsonIgnore
    private transient GradingStrategy gradingStrategy = new AbsoluteGrading();

    public Student() {
        super();
    }

    public Student(String id, String name, String email, String password,
                   String rollNumber, String departmentId, String classId, int semester) {
        super(id, name, email, password);
        setRollNumber(rollNumber);
        setDepartmentId(departmentId);
        setClassId(classId);
        setSemester(semester);
        setAttendancePercentage(100.0);
        setAcademicPercentage(0.0);
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        ValidationUtil.validateNotBlank(rollNumber, "Roll Number");
        this.rollNumber = rollNumber.trim().toUpperCase();
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        ValidationUtil.validateNotBlank(departmentId, "Department ID");
        this.departmentId = departmentId.trim();
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        ValidationUtil.validateNotBlank(classId, "Class ID");
        this.classId = classId.trim();
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        if (semester < 1 || semester > 8) {
            throw new IllegalArgumentException("Semester must be between 1 and 8.");
        }
        this.semester = semester;
    }

    @Override
    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    // OOP: Encapsulation - validates attendance percentage 0..100
    public void setAttendancePercentage(double attendancePercentage) {
        if (Double.isNaN(attendancePercentage) || attendancePercentage < 0.0 || attendancePercentage > 100.0) {
            throw new InvalidAttendanceException(
                    String.format("Invalid attendance percentage %.2f: must be between 0 and 100.", attendancePercentage));
        }
        this.attendancePercentage = Math.round(attendancePercentage * 100.0) / 100.0;
    }

    @Override
    public double getAcademicPercentage() {
        return academicPercentage;
    }

    public void setAcademicPercentage(double academicPercentage) {
        ValidationUtil.validatePercentage(academicPercentage, "Academic percentage");
        this.academicPercentage = Math.round(academicPercentage * 100.0) / 100.0;
    }

    @JsonIgnore
    public List<Double> getCohortPercentages() {
        return cohortPercentages == null ? Collections.emptyList() : cohortPercentages;
    }

    @JsonIgnore
    public void setCohortPercentages(List<Double> cohortPercentages) {
        this.cohortPercentages = cohortPercentages == null ? new ArrayList<>() : new ArrayList<>(cohortPercentages);
    }

    @JsonIgnore
    public GradingStrategy getGradingStrategy() {
        if (gradingStrategy == null) {
            gradingStrategy = new AbsoluteGrading();
        }
        return gradingStrategy;
    }

    @JsonIgnore
    public void setGradingStrategy(GradingStrategy gradingStrategy) {
        this.gradingStrategy = gradingStrategy == null ? new AbsoluteGrading() : gradingStrategy;
    }

    // OOP: Interface Method Implementation (Gradable)
    @Override
    public String calculateGrade() {
        return getGradingStrategy().assignGrade(academicPercentage, getCohortPercentages());
    }

    // OOP: Interface Method Implementation (Trackable)
    @Override
    public boolean hasAttendanceShortage() {
        return attendancePercentage < MINIMUM_REQUIRED_ATTENDANCE;
    }

    @Override
    public UserRole getRole() {
        return UserRole.STUDENT;
    }

    // OOP: Runtime Polymorphism - overrides abstract Person.getDashboardSummary()
    @Override
    public String getDashboardSummary() {
        String shortageNote = hasAttendanceShortage() ? "Attendance Shortage (<75%)" : "Attendance Eligible";
        return String.format("%s (%s) | Class %s | Attendance: %.1f%% (%s) | Score: %.1f%% | Grade: %s",
                getName(), rollNumber, classId, attendancePercentage, shortageNote, academicPercentage, calculateGrade());
    }
}
