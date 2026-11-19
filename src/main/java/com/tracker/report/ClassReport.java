package com.tracker.report;

import com.tracker.model.AcademicClass;
import com.tracker.model.Assessment;
import com.tracker.model.Student;
import com.tracker.repository.DataStore;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// OOP: Inheritance (extends BaseReport) & Runtime Polymorphism (overrides generate())
public class ClassReport extends BaseReport {
    private final String classId;

    public ClassReport(DataStore dataStore, GradingStrategy gradingStrategy, String classId) {
        super(dataStore, gradingStrategy);
        this.classId = classId;
    }

    @Override
    public String getTitle() {
        AcademicClass academicClass = getDataStore().getClasses().get(classId);
        return academicClass != null
                ? "Class Performance Report: " + academicClass.getName()
                : "Class Performance Report: " + classId;
    }

    @Override
    public ReportData generate() {
        AcademicClass academicClass = getDataStore().getClasses().get(classId);
        if (academicClass == null) {
            throw new IllegalArgumentException("Class not found: " + classId);
        }

        List<Student> classStudents = getDataStore().getStudents().values().stream()
                .filter(s -> classId.equals(s.getClassId()))
                .sorted(Comparator.comparingDouble(Student::getAcademicPercentage).reversed())
                .collect(Collectors.toList());

        List<Double> cohortScores = classStudents.stream()
                .map(Student::getAcademicPercentage)
                .collect(Collectors.toList());

        ReportData report = initializeReportData(
                "CLASS",
                classId,
                String.format("Semester %d | Section %s | Subjects: %s",
                        academicClass.getSemester(), academicClass.getSection(), String.join(", ", academicClass.getSubjects()))
        );

        double avgAttendance = classStudents.stream().mapToDouble(Student::getAttendancePercentage).average().orElse(0.0);
        double avgMarks = classStudents.stream().mapToDouble(Student::getAcademicPercentage).average().orElse(0.0);

        List<Map<String, Object>> rankingRows = new ArrayList<>();
        List<Map<String, Object>> shortageRows = new ArrayList<>();

        int rank = 1;
        for (Student student : classStudents) {
            student.setCohortPercentages(cohortScores);
            student.setGradingStrategy(getGradingStrategy());
            String grade = student.calculateGrade();
            String status = student.hasAttendanceShortage() ? "Shortage" : "Eligible";

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rank", rank++);
            row.put("studentId", student.getId());
            row.put("rollNumber", student.getRollNumber());
            row.put("studentName", student.getName());
            row.put("attendancePercentage", roundTwo(student.getAttendancePercentage()));
            row.put("academicPercentage", roundTwo(student.getAcademicPercentage()));
            row.put("grade", grade);
            row.put("eligibilityStatus", status);
            rankingRows.add(row);

            if (student.hasAttendanceShortage()) {
                Map<String, Object> shortRow = new LinkedHashMap<>();
                shortRow.put("studentId", student.getId());
                shortRow.put("rollNumber", student.getRollNumber());
                shortRow.put("studentName", student.getName());
                shortRow.put("attendancePercentage", roundTwo(student.getAttendancePercentage()));
                shortRow.put("deficitPercentage", roundTwo(Student.MINIMUM_REQUIRED_ATTENDANCE - student.getAttendancePercentage()));
                shortageRows.add(shortRow);
            }
        }

        // Subject averages for chart
        List<Assessment> assessmentsSnapshot = getDataStore().getAssessmentsSnapshot();
        List<String> subjectLabels = new ArrayList<>();
        List<Double> subjectAverages = new ArrayList<>();
        for (String subject : academicClass.getSubjects()) {
            double subjectAvg = assessmentsSnapshot.stream()
                    .filter(a -> classId.equals(a.getClassId()) && subject.equalsIgnoreCase(a.getSubject()))
                    .mapToDouble(Assessment::getPercentageScore)
                    .average()
                    .orElse(0.0);
            subjectLabels.add(subject);
            subjectAverages.add(roundTwo(subjectAvg));
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalStudents", classStudents.size());
        summary.put("averageAttendance", roundTwo(avgAttendance));
        summary.put("averageMarks", roundTwo(avgMarks));
        summary.put("shortageCount", shortageRows.size());
        summary.put("topperName", classStudents.isEmpty() ? "N/A" : classStudents.get(0).getName());
        summary.put("topperScore", classStudents.isEmpty() ? 0.0 : roundTwo(classStudents.get(0).getAcademicPercentage()));
        report.setSummaryMetrics(summary);

        report.setPrimaryRows(rankingRows);
        report.setSecondaryRows(shortageRows);

        Map<String, Object> chartSeries = new LinkedHashMap<>();
        chartSeries.put("labels", subjectLabels);
        chartSeries.put("subjectAverages", subjectAverages);
        report.setChartSeries(chartSeries);

        report.setRemarks(String.format(
                "%s has %d students enrolled with %.1f%% mean score. %d student(s) require attendance counseling (<75%%).",
                academicClass.getName(), classStudents.size(), avgMarks, shortageRows.size()
        ));
        return report;
    }
}
