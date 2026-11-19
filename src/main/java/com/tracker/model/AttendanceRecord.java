package com.tracker.model;

import com.tracker.exception.InvalidAttendanceException;
import com.tracker.util.ValidationUtil;

import java.time.LocalDate;
import java.time.LocalDateTime;

// OOP: Encapsulation - private fields with validated setters
public class AttendanceRecord {
    private String id;
    private String studentId;
    private String classId;
    private String subject;
    private LocalDate date;
    private AttendanceStatus status;
    private String markedBy;
    private LocalDateTime markedAt;
    private String remarks;

    public AttendanceRecord() {
    }

    public AttendanceRecord(String id, String studentId, String classId, String subject,
                            LocalDate date, AttendanceStatus status, String markedBy,
                            LocalDateTime markedAt, String remarks) {
        setId(id);
        setStudentId(studentId);
        setClassId(classId);
        setSubject(subject);
        setDate(date);
        setStatus(status);
        setMarkedBy(markedBy);
        setMarkedAt(markedAt);
        setRemarks(remarks);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        ValidationUtil.validateNotBlank(id, "Attendance Record ID");
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        if (date == null) {
            throw new InvalidAttendanceException("Attendance date must not be null.");
        }
        this.date = date;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        if (status == null) {
            throw new InvalidAttendanceException("Attendance status must not be null.");
        }
        this.status = status;
    }

    public String getMarkedBy() {
        return markedBy;
    }

    public void setMarkedBy(String markedBy) {
        this.markedBy = (markedBy == null || markedBy.isBlank()) ? "SYSTEM" : markedBy.trim();
    }

    public LocalDateTime getMarkedAt() {
        return markedAt;
    }

    public void setMarkedAt(LocalDateTime markedAt) {
        this.markedAt = markedAt == null ? LocalDateTime.now() : markedAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks == null ? "" : remarks.trim();
    }
}
