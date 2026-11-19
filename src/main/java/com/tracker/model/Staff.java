package com.tracker.model;

import com.tracker.util.ValidationUtil;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// OOP: Inheritance (Abstract Staff Base Class extending Person) & Runtime Polymorphism
public abstract class Staff extends Person {
    private String departmentId;
    private String designation;
    private List<String> assignedClassIds = new ArrayList<>();
    private List<String> subjects = new ArrayList<>();
    private List<String> overseenDepartmentIds = new ArrayList<>();

    protected Staff() {
        super();
    }

    protected Staff(String id, String name, String email, String password,
                    String departmentId, String designation,
                    List<String> assignedClassIds, List<String> subjects) {
        super(id, name, email, password);
        setDepartmentId(departmentId);
        setDesignation(designation);
        setAssignedClassIds(assignedClassIds);
        setSubjects(subjects);
        this.overseenDepartmentIds = new ArrayList<>(List.of(this.departmentId));
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        ValidationUtil.validateNotBlank(departmentId, "Department ID");
        this.departmentId = departmentId.trim();
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        ValidationUtil.validateNotBlank(designation, "Designation");
        this.designation = designation.trim();
    }

    public List<String> getAssignedClassIds() {
        return Collections.unmodifiableList(assignedClassIds);
    }

    public void setAssignedClassIds(List<String> assignedClassIds) {
        this.assignedClassIds = assignedClassIds == null ? new ArrayList<>() : new ArrayList<>(assignedClassIds);
    }

    public List<String> getSubjects() {
        return Collections.unmodifiableList(subjects);
    }

    public void setSubjects(List<String> subjects) {
        this.subjects = subjects == null ? new ArrayList<>() : new ArrayList<>(subjects);
    }

    public List<String> getOverseenDepartmentIds() {
        return Collections.unmodifiableList(overseenDepartmentIds);
    }

    public void setOverseenDepartmentIds(List<String> overseenDepartmentIds) {
        if (overseenDepartmentIds == null || overseenDepartmentIds.isEmpty()) {
            this.overseenDepartmentIds = this.departmentId == null ? new ArrayList<>() : new ArrayList<>(List.of(this.departmentId));
        } else {
            this.overseenDepartmentIds = new ArrayList<>(overseenDepartmentIds);
        }
    }

    // OOP: Runtime Polymorphism - overridden by every Staff subclass
    public abstract String getRoleTitle();

    // OOP: Runtime Polymorphism - overridden by every Staff subclass
    public abstract List<String> getPermissions();
}
