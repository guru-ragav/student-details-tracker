package com.tracker.model;

import java.util.List;

// OOP: Inheritance (extends Staff) & Runtime Polymorphism
public class HeadOfDepartment extends Staff {

    public HeadOfDepartment() {
        super();
    }

    public HeadOfDepartment(String id, String name, String email, String password,
                            String departmentId, String designation, List<String> subjects) {
        super(id, name, email, password, departmentId, designation, List.of(), subjects);
    }

    @Override
    public UserRole getRole() {
        return UserRole.HOD;
    }

    @Override
    public String getRoleTitle() {
        return "Head of Department";
    }

    @Override
    public List<String> getPermissions() {
        return List.of("MANAGE_DEPARTMENT", "VIEW_STAFF_DIRECTORY", "VIEW_DEPARTMENT_REPORT");
    }

    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Dept: %s | Full Departmental Oversight",
                getName(), getRoleTitle(), getDepartmentId());
    }
}
