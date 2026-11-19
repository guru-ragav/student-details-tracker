package com.tracker.report;

// OOP: Interface implemented by all report classes
public interface Reportable {
    ReportData generate();

    String getTitle();
}
