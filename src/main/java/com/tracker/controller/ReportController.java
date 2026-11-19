package com.tracker.controller;

import com.tracker.report.ReportData;
import com.tracker.service.ReportService;
import com.tracker.service.TrackerContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService = TrackerContext.getInstance().getReportService();

    @GetMapping("/department/{departmentId}")
    public ReportData getDepartmentReport(@PathVariable String departmentId) {
        return reportService.generateDepartmentReport(departmentId);
    }

    @GetMapping("/class/{classId}")
    public ReportData getClassReport(@PathVariable String classId) {
        return reportService.generateClassReport(classId);
    }

    @GetMapping("/student/{studentId}")
    public ReportData getStudentReport(@PathVariable String studentId) {
        return reportService.generateStudentReport(studentId);
    }

    @PostMapping("/generate-all")
    public Map<String, Object> generateAllReportsParallel() {
        return reportService.generateAllReportsAsync();
    }
}
