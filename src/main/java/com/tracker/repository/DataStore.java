package com.tracker.repository;

import com.tracker.model.AcademicClass;
import com.tracker.model.Administrator;
import com.tracker.model.Assessment;
import com.tracker.model.AttendanceRecord;
import com.tracker.model.Department;
import com.tracker.model.Faculty;
import com.tracker.model.Staff;
import com.tracker.model.Student;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// OOP: In-memory thread-safe collections repository backing JSON persistence
public class DataStore {
    private final Map<String, Department> departments = new ConcurrentHashMap<>();
    private final Map<String, AcademicClass> classes = new ConcurrentHashMap<>();
    private final Map<String, Student> students = new ConcurrentHashMap<>();
    private final Map<String, Faculty> faculty = new ConcurrentHashMap<>();
    private final Map<String, Staff> staffMembers = new ConcurrentHashMap<>();
    private final Map<String, Administrator> administrators = new ConcurrentHashMap<>();
    private final List<AttendanceRecord> attendanceRecords = Collections.synchronizedList(new ArrayList<>());
    private final List<Assessment> assessments = Collections.synchronizedList(new ArrayList<>());

    private volatile String activeGradingStrategyName = "ABSOLUTE";
    private volatile boolean dirty = false;

    public Map<String, Department> getDepartments() {
        return departments;
    }

    public Map<String, AcademicClass> getClasses() {
        return classes;
    }

    public Map<String, Student> getStudents() {
        return students;
    }

    public Map<String, Faculty> getFaculty() {
        return faculty;
    }

    public Map<String, Staff> getStaffMembers() {
        return staffMembers;
    }

    public Map<String, Administrator> getAdministrators() {
        return administrators;
    }

    public List<AttendanceRecord> getAttendanceRecords() {
        return attendanceRecords;
    }

    public List<AttendanceRecord> getAttendanceSnapshot() {
        synchronized (attendanceRecords) {
            return new ArrayList<>(attendanceRecords);
        }
    }

    public List<Assessment> getAssessments() {
        return assessments;
    }

    public List<Assessment> getAssessmentsSnapshot() {
        synchronized (assessments) {
            return new ArrayList<>(assessments);
        }
    }

    public String getActiveGradingStrategyName() {
        return activeGradingStrategyName;
    }

    public void setActiveGradingStrategyName(String activeGradingStrategyName) {
        this.activeGradingStrategyName = activeGradingStrategyName;
        this.dirty = true;
    }

    public boolean isDirty() {
        return dirty;
    }

    public void markDirty() {
        this.dirty = true;
    }

    public void clearDirty() {
        this.dirty = false;
    }
}
