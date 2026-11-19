package com.tracker.model;

import com.tracker.util.ValidationUtil;

// OOP: Encapsulation - private fields with validated setters
public class Department {
    private String id;
    private String code;
    private String name;
    private String headOfDepartment;

    public Department() {
    }

    public Department(String id, String code, String name, String headOfDepartment) {
        setId(id);
        setCode(code);
        setName(name);
        setHeadOfDepartment(headOfDepartment);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        ValidationUtil.validateNotBlank(id, "Department ID");
        this.id = id.trim();
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        ValidationUtil.validateNotBlank(code, "Department Code");
        this.code = code.trim().toUpperCase();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        ValidationUtil.validateNotBlank(name, "Department Name");
        this.name = name.trim();
    }

    public String getHeadOfDepartment() {
        return headOfDepartment;
    }

    public void setHeadOfDepartment(String headOfDepartment) {
        ValidationUtil.validateNotBlank(headOfDepartment, "Head of Department");
        this.headOfDepartment = headOfDepartment.trim();
    }
}
