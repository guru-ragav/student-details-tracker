package com.tracker.service;

import com.tracker.concurrent.ReportTaskExecutor;
import com.tracker.model.AcademicClass;
import com.tracker.model.Department;
import com.tracker.model.Student;
import com.tracker.report.ClassReport;
import com.tracker.report.DepartmentReport;
import com.tracker.report.GradingStrategy;
import com.tracker.report.ReportData;
import com.tracker.report.Reportable;
import com.tracker.report.StudentReport;
import com.tracker.repository.DataStore;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

// OOP: Plain Java Service coordinating polymorphic Reportable generation using ExecutorService & CompletableFuture
public class ReportService {
    private final DataStore dataStore;
    private final AcademicService academicService;
    private final ReportTaskExecutor taskExecutor;

    public ReportService(DataStore dataStore, AcademicService academicService, ReportTaskExecutor taskExecutor) {
        this.dataStore = dataStore;
        this.academicService = academicService;
        this.taskExecutor = taskExecutor;
    }

    public ReportData generateDepartmentReport(String departmentId) {
        GradingStrategy strategy = academicService.getActiveGradingStrategy();
        Reportable report = new DepartmentReport(dataStore, strategy, departmentId);
        return taskExecutor.submitReportAsync(report).join();
    }

    public ReportData generateClassReport(String classId) {
        GradingStrategy strategy = academicService.getActiveGradingStrategy();
        Reportable report = new ClassReport(dataStore, strategy, classId);
        return taskExecutor.submitReportAsync(report).join();
    }

    public ReportData generateStudentReport(String studentId) {
        GradingStrategy strategy = academicService.getActiveGradingStrategy();
        Reportable report = new StudentReport(dataStore, strategy, studentId);
        return taskExecutor.submitReportAsync(report).join();
    }

    public Map<String, Object> generateAllReportsAsync() {
        long startedAt = System.currentTimeMillis();
        GradingStrategy strategy = academicService.getActiveGradingStrategy();

        List<Reportable> allReports = new ArrayList<>();
        for (Department department : dataStore.getDepartments().values()) {
            allReports.add(new DepartmentReport(dataStore, strategy, department.getId()));
        }
        for (AcademicClass academicClass : dataStore.getClasses().values()) {
            allReports.add(new ClassReport(dataStore, strategy, academicClass.getId()));
        }
        for (Student student : dataStore.getStudents().values()) {
            allReports.add(new StudentReport(dataStore, strategy, student.getId()));
        }

        CompletableFuture<List<ReportData>> future = taskExecutor.generateAllParallel(allReports);
        List<ReportData> generated = future.join();
        long elapsedMs = System.currentTimeMillis() - startedAt;

        List<ReportData> departmentReports = new ArrayList<>();
        List<ReportData> classReports = new ArrayList<>();
        List<ReportData> studentReports = new ArrayList<>();

        for (ReportData data : generated) {
            switch (data.getReportType()) {
                case "DEPARTMENT" -> departmentReports.add(data);
                case "CLASS" -> classReports.add(data);
                case "STUDENT" -> studentReports.add(data);
                default -> {
                }
            }
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("totalGenerated", generated.size());
        payload.put("elapsedMilliseconds", elapsedMs);
        payload.put("coordinatorThread", Thread.currentThread().getName());
        payload.put("gradingStrategy", strategy.getStrategyName());
        payload.put("departmentReports", departmentReports);
        payload.put("classReports", classReports);
        payload.put("studentReports", studentReports);
        return payload;
    }
}
