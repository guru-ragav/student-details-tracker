package com.tracker.model;

// OOP: Interface defining attendance tracking behavior
public interface Trackable {
    double getAttendancePercentage();

    boolean hasAttendanceShortage();
}
