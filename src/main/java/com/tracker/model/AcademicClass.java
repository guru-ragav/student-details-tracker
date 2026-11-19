package com.tracker.model;

import com.tracker.util.ValidationUtil;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// OOP: Encapsulation - private fields with validated setters
public class AcademicClass {
    private String id;
    private String name;
    private String departmentId;
    private int semester;
    private String section;
    private List<String> subjects = new ArrayList<>();

    public AcademicClass() {
    }

    public AcademicClass(String id, String name, String departmentId, int semester, String section, List<String> subjects) {
        setId(id);
        setName(name);
        setDepartmentId(departmentId);
        setSemester(semester);
        setSection(section);
        setSubjects(subjects);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        ValidationUtil.validateNotBlank(id, "Class ID");
        this.id = id.trim();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        ValidationUtil.validateNotBlank(name, "Class Name");
        this.name = name.trim();
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        ValidationUtil.validateNotBlank(departmentId, "Department ID");
        this.departmentId = departmentId.trim();
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        if (semester < 1 || semester > 8) {
            throw new IllegalArgumentException("Semester must be between 1 and 8.");
        }
        this.semester = semester;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        ValidationUtil.validateNotBlank(section, "Section");
        this.section = section.trim().toUpperCase();
    }

    public List<String> getSubjects() {
        return Collections.unmodifiableList(subjects);
    }

    public void setSubjects(List<String> subjects) {
        if (subjects == null || subjects.isEmpty()) {
            throw new IllegalArgumentException("At least one subject is required for a class.");
        }
        this.subjects = new ArrayList<>(subjects);
    }
}
