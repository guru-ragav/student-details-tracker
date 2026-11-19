package com.tracker.model;

import com.tracker.util.ValidationUtil;

// OOP: Inheritance (extends Person)
public class Administrator extends Person {
    // OOP: Encapsulation - private fields
    private String designation;
    private String officeLocation;

    public Administrator() {
        super();
    }

    public Administrator(String id, String name, String email, String password,
                         String designation, String officeLocation) {
        super(id, name, email, password);
        setDesignation(designation);
        setOfficeLocation(officeLocation);
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        ValidationUtil.validateNotBlank(designation, "Designation");
        this.designation = designation.trim();
    }

    public String getOfficeLocation() {
        return officeLocation;
    }

    public void setOfficeLocation(String officeLocation) {
        ValidationUtil.validateNotBlank(officeLocation, "Office Location");
        this.officeLocation = officeLocation.trim();
    }

    @Override
    public UserRole getRole() {
        return UserRole.ADMIN;
    }

    // OOP: Runtime Polymorphism - overrides abstract Person.getDashboardSummary()
    @Override
    public String getDashboardSummary() {
        return String.format("%s (%s) | Office: %s | Full Institutional Access",
                getName(), designation, officeLocation);
    }
}
