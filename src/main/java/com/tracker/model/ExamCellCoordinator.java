package com.tracker.model;

import java.util.List;

// OOP: Inheritance (extends Staff) & Runtime Polymorphism
public class ExamCellCoordinator extends Staff {

    public ExamCellCoordinator() {
        super();
    }

    public ExamCellCoordinator(String id, String name, String email, String password,
                               String departmentId, String designation, List<String> assignedClassIds) {
        super(id, name, email, password, departmentId, designation, assignedClassIds, List.of("Internal Assessment Audit"));
    }

    @Override
    public UserRole getRole() {
        return UserRole.EXAM_CELL_COORDINATOR;
    }

    @Override
    public String getRoleTitle() {
        return "Exam Cell Coordinator";
    }

    @Override
    public List<String> getPermissions() {
        return List.of("VIEW_DEPARTMENT_MARKS", "VERIFY_INTERNAL_MARKS");
    }

    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Dept: %s | Verifying Internal Marks Across %d Classes",
                getName(), getRoleTitle(), getDepartmentId(), getAssignedClassIds().size());
    }
}
