package com.tracker.model;

import java.util.List;

// OOP: Inheritance (extends Staff) & Runtime Polymorphism
public class SubjectFaculty extends Staff {

    public SubjectFaculty() {
        super();
    }

    public SubjectFaculty(String id, String name, String email, String password,
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
        return "Subject Faculty";
    }

    @Override
    public List<String> getPermissions() {
        return List.of("MARK_ATTENDANCE", "ENTER_INTERNAL_MARKS", "VIEW_ASSIGNED_CLASS_REPORT");
    }

    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Dept: %s | Teaching %s (%d Classes)",
                getName(), getRoleTitle(), getDepartmentId(), String.join(", ", getSubjects()), getAssignedClassIds().size());
    }
}
