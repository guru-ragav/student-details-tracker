package com.tracker.report;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// OOP: Encapsulated Report payload returned by Reportable.generate()
public class ReportData {
    private String reportType;
    private String targetId;
    private String title;
    private String subtitle;
    private String generatedByThread;
    private LocalDateTime generatedAt;
    private String gradingStrategy;
    private Map<String, Object> summaryMetrics = new LinkedHashMap<>();
    private List<Map<String, Object>> primaryRows = new ArrayList<>();
    private List<Map<String, Object>> secondaryRows = new ArrayList<>();
    private Map<String, Object> chartSeries = new LinkedHashMap<>();
    private String remarks;

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getGeneratedByThread() {
        return generatedByThread;
    }

    public void setGeneratedByThread(String generatedByThread) {
        this.generatedByThread = generatedByThread;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getGradingStrategy() {
        return gradingStrategy;
    }

    public void setGradingStrategy(String gradingStrategy) {
        this.gradingStrategy = gradingStrategy;
    }

    public Map<String, Object> getSummaryMetrics() {
        return summaryMetrics;
    }

    public void setSummaryMetrics(Map<String, Object> summaryMetrics) {
        this.summaryMetrics = summaryMetrics;
    }

    public List<Map<String, Object>> getPrimaryRows() {
        return primaryRows;
    }

    public void setPrimaryRows(List<Map<String, Object>> primaryRows) {
        this.primaryRows = primaryRows;
    }

    public List<Map<String, Object>> getSecondaryRows() {
        return secondaryRows;
    }

    public void setSecondaryRows(List<Map<String, Object>> secondaryRows) {
        this.secondaryRows = secondaryRows;
    }

    public Map<String, Object> getChartSeries() {
        return chartSeries;
    }

    public void setChartSeries(Map<String, Object> chartSeries) {
        this.chartSeries = chartSeries;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
