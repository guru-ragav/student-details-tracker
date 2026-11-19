package com.tracker.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.tracker.util.ValidationUtil;

// OOP: Inheritance (Abstract Base Class) & Encapsulation
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "personType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Student.class, name = "STUDENT"),
        @JsonSubTypes.Type(value = Faculty.class, name = "FACULTY"),
        @JsonSubTypes.Type(value = Administrator.class, name = "ADMIN"),
        @JsonSubTypes.Type(value = Dean.class, name = "DEAN"),
        @JsonSubTypes.Type(value = HeadOfDepartment.class, name = "HOD"),
        @JsonSubTypes.Type(value = AcademicCoordinator.class, name = "ACADEMIC_COORDINATOR"),
        @JsonSubTypes.Type(value = ClassAdvisor.class, name = "CLASS_ADVISOR"),
        @JsonSubTypes.Type(value = ExamCellCoordinator.class, name = "EXAM_CELL_COORDINATOR"),
        @JsonSubTypes.Type(value = LabInstructor.class, name = "LAB_INSTRUCTOR"),
        @JsonSubTypes.Type(value = SubjectFaculty.class, name = "SUBJECT_FACULTY")
})
public abstract class Person {
    // OOP: Encapsulation - all fields private
    private String id;
    private String name;
    private String email;
    private String password;

    protected Person() {
    }

    protected Person(String id, String name, String email, String password) {
        setId(id);
        setName(name);
        setEmail(email);
        setPassword(password);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        ValidationUtil.validateNotBlank(id, "ID");
        this.id = id.trim();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        ValidationUtil.validateNotBlank(name, "Name");
        this.name = name.trim();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        ValidationUtil.validateEmail(email);
        this.email = email.trim().toLowerCase();
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        ValidationUtil.validateNotBlank(password, "Password");
        this.password = password;
    }

    public abstract UserRole getRole();

    // OOP: Runtime Polymorphism - overridden by Student, Administrator, and Staff subclasses
    public abstract String getDashboardSummary();
}
