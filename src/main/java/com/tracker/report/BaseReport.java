package com.tracker.report;

import com.tracker.repository.DataStore;

import java.time.LocalDateTime;

// OOP: Abstract Base Report implementing Reportable for runtime polymorphism
public abstract class BaseReport implements Reportable {
    private final DataStore dataStore;
    private final GradingStrategy gradingStrategy;

    protected BaseReport(DataStore dataStore, GradingStrategy gradingStrategy) {
        this.dataStore = dataStore;
        this.gradingStrategy = gradingStrategy == null ? new AbsoluteGrading() : gradingStrategy;
    }

    protected DataStore getDataStore() {
        return dataStore;
    }

    protected GradingStrategy getGradingStrategy() {
        return gradingStrategy;
    }

    protected ReportData initializeReportData(String reportType, String targetId, String subtitle) {
        ReportData data = new ReportData();
        data.setReportType(reportType);
        data.setTargetId(targetId);
        data.setTitle(getTitle());
        data.setSubtitle(subtitle);
        data.setGeneratedByThread(Thread.currentThread().getName());
        data.setGeneratedAt(LocalDateTime.now());
        data.setGradingStrategy(gradingStrategy.getStrategyName());
        return data;
    }

    protected double roundTwo(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // OOP: Runtime Polymorphism - overridden by DepartmentReport, ClassReport, StudentReport
    @Override
    public abstract ReportData generate();
}
