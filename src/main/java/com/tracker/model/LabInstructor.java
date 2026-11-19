package com.tracker.model;

import java.util.List;

// OOP: Inheritance (extends Staff) & Runtime Polymorphism
public class LabInstructor extends Staff {

    public LabInstructor() {
        super();
    }

    public LabInstructor(String id, String name, String email, String password,
                         String departmentId, String designation,
                         List<String> assignedClassIds, List<String> subjects) {
        super(id, name, email, password, departmentId, designation, assignedClassIds, subjects);
    }

    @Override
    public UserRole getRole() {
        return UserRole.FACULTY;
    }

    @Override
    public String getRoleTitle() {
        return "Lab Instructor";
    }

    @Override
    public List<String> getPermissions() {
        return List.of("CONDUCT_LAB_SESSIONS", "ENTER_LAB_RECORD_MARKS");
    }

    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Dept: %s | Labs: %d | Classes: %d",
                getName(), getRoleTitle(), getDepartmentId(), getSubjects().size(), getAssignedClassIds().size());
    }
}
