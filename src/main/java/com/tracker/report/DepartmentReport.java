package com.tracker.report;

import com.tracker.model.AcademicClass;
import com.tracker.model.Department;
import com.tracker.model.Student;
import com.tracker.repository.DataStore;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// OOP: Inheritance (extends BaseReport) & Runtime Polymorphism (overrides generate())
public class DepartmentReport extends BaseReport {
    private final String departmentId;

    public DepartmentReport(DataStore dataStore, GradingStrategy gradingStrategy, String departmentId) {
        super(dataStore, gradingStrategy);
        this.departmentId = departmentId;
    }

    @Override
    public String getTitle() {
        Department department = getDataStore().getDepartments().get(departmentId);
        return department != null
                ? "Department Performance Report: " + department.getName()
                : "Department Performance Report: " + departmentId;
    }

    @Override
    public ReportData generate() {
        Department department = getDataStore().getDepartments().get(departmentId);
        if (department == null) {
            throw new IllegalArgumentException("Department not found: " + departmentId);
        }

        List<Student> deptStudents = getDataStore().getStudents().values().stream()
                .filter(s -> departmentId.equals(s.getDepartmentId()))
                .collect(Collectors.toList());

        List<AcademicClass> deptClasses = getDataStore().getClasses().values().stream()
                .filter(c -> departmentId.equals(c.getDepartmentId()))
                .sorted(Comparator.comparing(AcademicClass::getName))
                .collect(Collectors.toList());

        ReportData report = initializeReportData(
                "DEPARTMENT",
                departmentId,
                String.format("Code: %s | Head of Department: %s", department.getCode(), department.getHeadOfDepartment())
        );

        double avgAttendance = deptStudents.stream()
                .mapToDouble(Student::getAttendancePercentage)
                .average()
                .orElse(0.0);

        double avgMarks = deptStudents.stream()
                .mapToDouble(Student::getAcademicPercentage)
                .average()
                .orElse(0.0);

        long passCount = deptStudents.stream()
                .filter(s -> s.getAcademicPercentage() >= 40.0)
                .count();
        double passPercentage = deptStudents.isEmpty() ? 0.0 : (passCount * 100.0) / deptStudents.size();

        long shortageCount = deptStudents.stream()
                .filter(Student::hasAttendanceShortage)
                .count();

        Student topper = deptStudents.stream()
                .max(Comparator.comparingDouble(Student::getAcademicPercentage))
                .orElse(null);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("departmentCode", department.getCode());
        summary.put("totalStudents", deptStudents.size());
        summary.put("totalClasses", deptClasses.size());
        summary.put("averageAttendance", roundTwo(avgAttendance));
        summary.put("averageMarks", roundTwo(avgMarks));
        summary.put("passPercentage", roundTwo(passPercentage));
        summary.put("shortageCount", shortageCount);
        summary.put("topperName", topper != null ? topper.getName() : "N/A");
        summary.put("topperRollNumber", topper != null ? topper.getRollNumber() : "N/A");
        summary.put("topperScore", topper != null ? roundTwo(topper.getAcademicPercentage()) : 0.0);
        report.setSummaryMetrics(summary);

        List<Map<String, Object>> classRows = new ArrayList<>();
        List<String> chartLabels = new ArrayList<>();
        List<Double> chartAttendance = new ArrayList<>();
        List<Double> chartMarks = new ArrayList<>();

        for (AcademicClass academicClass : deptClasses) {
            List<Student> classStudents = deptStudents.stream()
                    .filter(s -> academicClass.getId().equals(s.getClassId()))
                    .collect(Collectors.toList());

            double clsAvgAtt = classStudents.stream().mapToDouble(Student::getAttendancePercentage).average().orElse(0.0);
            double clsAvgMarks = classStudents.stream().mapToDouble(Student::getAcademicPercentage).average().orElse(0.0);
            long clsPass = classStudents.stream().filter(s -> s.getAcademicPercentage() >= 40.0).count();
            double clsPassPct = classStudents.isEmpty() ? 0.0 : (clsPass * 100.0) / classStudents.size();
            Student clsTopper = classStudents.stream().max(Comparator.comparingDouble(Student::getAcademicPercentage)).orElse(null);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("classId", academicClass.getId());
            row.put("className", academicClass.getName());
            row.put("studentCount", classStudents.size());
            row.put("averageAttendance", roundTwo(clsAvgAtt));
            row.put("averageMarks", roundTwo(clsAvgMarks));
            row.put("passPercentage", roundTwo(clsPassPct));
            row.put("topper", clsTopper != null ? clsTopper.getName() + " (" + roundTwo(clsTopper.getAcademicPercentage()) + "%)" : "N/A");
            classRows.add(row);

            chartLabels.add(academicClass.getName());
            chartAttendance.add(roundTwo(clsAvgAtt));
            chartMarks.add(roundTwo(clsAvgMarks));
        }

        report.setPrimaryRows(classRows);

        Map<String, Object> chartSeries = new LinkedHashMap<>();
        chartSeries.put("labels", chartLabels);
        chartSeries.put("attendance", chartAttendance);
        chartSeries.put("marks", chartMarks);
        report.setChartSeries(chartSeries);

        report.setRemarks(String.format(
                "Department %s achieved %.1f%% pass rate with %.1f%% average attendance. %d student(s) currently below the 75%% attendance threshold.",
                department.getCode(), passPercentage, avgAttendance, shortageCount
        ));
        return report;
    }
}
