package com.tracker.model;

import java.util.List;

// OOP: Inheritance (extends Staff) & Runtime Polymorphism
public class AcademicCoordinator extends Staff {

    public AcademicCoordinator() {
        super();
    }

    public AcademicCoordinator(String id, String name, String email, String password,
                               String departmentId, String designation, List<String> assignedClassIds) {
        super(id, name, email, password, departmentId, designation, assignedClassIds, List.of("Curriculum & Timetable"));
    }

    @Override
    public UserRole getRole() {
        return UserRole.ACADEMIC_COORDINATOR;
    }

    @Override
    public String getRoleTitle() {
        return "Academic Coordinator";
    }

    @Override
    public List<String> getPermissions() {
        return List.of("VIEW_DEPARTMENT_REPORT", "VIEW_CLASS_REPORTS");
    }

    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Dept: %s | Coordinating %d Classes",
                getName(), getRoleTitle(), getDepartmentId(), getAssignedClassIds().size());
    }
}
