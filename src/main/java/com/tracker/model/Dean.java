package com.tracker.model;

import java.util.List;

// OOP: Inheritance (extends Staff) & Runtime Polymorphism
public class Dean extends Staff {

    public Dean() {
        super();
    }

    public Dean(String id, String name, String email, String password,
                String primaryDepartmentId, List<String> overseenDepartmentIds,
                String designation) {
        super(id, name, email, password, primaryDepartmentId, designation, List.of(), List.of("Academic Governance"));
        setOverseenDepartmentIds(overseenDepartmentIds);
    }

    @Override
    public UserRole getRole() {
        return UserRole.DEAN;
    }

    @Override
    public String getRoleTitle() {
        return "Dean";
    }

    @Override
    public List<String> getPermissions() {
        return List.of("VIEW_SCHOOL_DEPARTMENTS", "VIEW_STAFF_DIRECTORY", "VIEW_DEPARTMENT_REPORT");
    }

    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Overseeing %d Department(s): %s",
                getName(), getRoleTitle(), getOverseenDepartmentIds().size(), String.join(", ", getOverseenDepartmentIds()));
    }
}
