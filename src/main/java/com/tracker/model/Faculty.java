package com.tracker.model;

import java.util.List;

// OOP: Inheritance (extends Staff) preserving backward compatibility with Faculty operations
public class Faculty extends Staff {

    public Faculty() {
        super();
    }

    public Faculty(String id, String name, String email, String password,
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
        return List.of("MARK_ATTENDANCE", "ENTER_INTERNAL_MARKS", "VIEW_CLASS_REPORT");
    }

    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Dept: %s | Classes: %d | Subjects: %d",
                getName(), getRoleTitle(), getDepartmentId(), getAssignedClassIds().size(), getSubjects().size());
    }
}
