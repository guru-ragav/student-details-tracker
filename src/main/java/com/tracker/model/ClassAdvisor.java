package com.tracker.model;

import java.util.List;

// OOP: Inheritance (extends Staff) & Runtime Polymorphism
public class ClassAdvisor extends Staff {

    public ClassAdvisor() {
        super();
    }

    public ClassAdvisor(String id, String name, String email, String password,
                        String departmentId, String designation,
                        List<String> assignedClassIds, List<String> subjects) {
        super(id, name, email, password, departmentId, designation, assignedClassIds, subjects);
    }

    @Override
    public UserRole getRole() {
        return UserRole.CLASS_ADVISOR;
    }

    @Override
    public String getRoleTitle() {
        return "Class Advisor";
    }

    @Override
    public List<String> getPermissions() {
        return List.of("VIEW_ADVISED_CLASS", "VIEW_CLASS_RANKING", "VIEW_SHORTAGE_LIST");
    }

    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Dept: %s | Advising Class: %s",
                getName(), getRoleTitle(), getDepartmentId(), String.join(", ", getAssignedClassIds()));
    }
}
