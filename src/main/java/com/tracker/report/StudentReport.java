package com.tracker.report;

import com.tracker.exception.StudentNotFoundException;
import com.tracker.model.AcademicClass;
import com.tracker.model.Assessment;
import com.tracker.model.AttendanceRecord;
import com.tracker.model.AttendanceStatus;
import com.tracker.model.Student;
import com.tracker.repository.DataStore;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// OOP: Inheritance (extends BaseReport) & Runtime Polymorphism (overrides generate())
public class StudentReport extends BaseReport {
    private final String studentId;

    public StudentReport(DataStore dataStore, GradingStrategy gradingStrategy, String studentId) {
        super(dataStore, gradingStrategy);
        this.studentId = studentId;
    }

    @Override
    public String getTitle() {
        Student student = getDataStore().getStudents().get(studentId);
        return student != null
                ? "Individual Performance Report: " + student.getName()
                : "Individual Performance Report: " + studentId;
    }

    @Override
    public ReportData generate() {
        Student student = getDataStore().getStudents().get(studentId);
        if (student == null) {
            throw new StudentNotFoundException(studentId);
        }

        AcademicClass academicClass = getDataStore().getClasses().get(student.getClassId());
        List<String> subjects = academicClass != null ? academicClass.getSubjects() : List.of();

        List<Double> cohortScores = getDataStore().getStudents().values().stream()
                .filter(s -> student.getClassId().equals(s.getClassId()))
                .map(Student::getAcademicPercentage)
                .collect(Collectors.toList());

        student.setCohortPercentages(cohortScores);
        student.setGradingStrategy(getGradingStrategy());
        String overallGrade = student.calculateGrade();

        ReportData report = initializeReportData(
                "STUDENT",
                studentId,
                String.format("Roll No: %s | Class: %s | Email: %s",
                        student.getRollNumber(),
                        academicClass != null ? academicClass.getName() : student.getClassId(),
                        student.getEmail())
        );

        List<AttendanceRecord> studentAttendance = getDataStore().getAttendanceSnapshot().stream()
                .filter(r -> studentId.equals(r.getStudentId()))
                .collect(Collectors.toList());

        List<Assessment> studentAssessments = getDataStore().getAssessmentsSnapshot().stream()
                .filter(a -> studentId.equals(a.getStudentId()))
                .sorted(Comparator.comparing(Assessment::getSubject).thenComparing(Assessment::getAssessedDate))
                .collect(Collectors.toList());

        List<Map<String, Object>> subjectRows = new ArrayList<>();
        List<String> chartLabels = new ArrayList<>();
        List<Double> chartAttendance = new ArrayList<>();
        List<Double> chartScores = new ArrayList<>();

        for (String subject : subjects) {
            List<AttendanceRecord> subAtt = studentAttendance.stream()
                    .filter(r -> subject.equalsIgnoreCase(r.getSubject()))
                    .collect(Collectors.toList());
            long present = subAtt.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long absent = subAtt.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
            long pending = subAtt.stream().filter(r -> r.getStatus() == AttendanceStatus.PENDING).count();
            long decided = present + absent;
            double subAttPct = decided == 0 ? 100.0 : (present * 100.0) / decided;

            List<Assessment> subAssessments = studentAssessments.stream()
                    .filter(a -> subject.equalsIgnoreCase(a.getSubject()))
                    .collect(Collectors.toList());

            double weightedTotal = subAssessments.stream()
                    .mapToDouble(Assessment::calculateWeightedScore)
                    .sum();

            String subGrade = getGradingStrategy().assignGrade(weightedTotal, cohortScores);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("subject", subject);
            row.put("presentCount", present);
            row.put("totalSessions", subAtt.size());
            row.put("pendingCount", pending);
            row.put("attendancePercentage", roundTwo(subAttPct));
            row.put("weightedScore", roundTwo(weightedTotal));
            row.put("grade", subGrade);
            row.put("attendanceStatus", subAttPct < Student.MINIMUM_REQUIRED_ATTENDANCE ? "Shortage" : "Eligible");
            subjectRows.add(row);

            chartLabels.add(subject);
            chartAttendance.add(roundTwo(subAttPct));
            chartScores.add(roundTwo(weightedTotal));
        }

        List<Map<String, Object>> marksTrendRows = new ArrayList<>();
        for (Assessment assessment : studentAssessments) {
            Map<String, Object> trendRow = new LinkedHashMap<>();
            trendRow.put("id", assessment.getId());
            trendRow.put("subject", assessment.getSubject());
            trendRow.put("title", assessment.getTitle());
            trendRow.put("category", assessment.getAssessmentCategory());
            trendRow.put("marksObtained", assessment.getMarksObtained());
            trendRow.put("maxMarks", assessment.getMaxMarks());
            trendRow.put("percentageScore", assessment.getPercentageScore());
            trendRow.put("weightedScore", assessment.calculateWeightedScore());
            trendRow.put("assessedDate", assessment.getAssessedDate().toString());
            marksTrendRows.add(trendRow);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("rollNumber", student.getRollNumber());
        summary.put("attendancePercentage", roundTwo(student.getAttendancePercentage()));
        summary.put("academicPercentage", roundTwo(student.getAcademicPercentage()));
        summary.put("grade", overallGrade);
        summary.put("lowAttendanceWarning", student.hasAttendanceShortage());
        summary.put("totalAssessments", studentAssessments.size());
        report.setSummaryMetrics(summary);

        report.setPrimaryRows(subjectRows);
        report.setSecondaryRows(marksTrendRows);

        Map<String, Object> chartSeries = new LinkedHashMap<>();
        chartSeries.put("labels", chartLabels);
        chartSeries.put("attendance", chartAttendance);
        chartSeries.put("scores", chartScores);
        report.setChartSeries(chartSeries);

        String remarks;
        if (student.hasAttendanceShortage()) {
            remarks = String.format(
                    "Warning: Attendance is %.1f%% (below the mandatory 75.0%% requirement). Academic grade is %s (%.1f%%). Immediate attendance improvement required.",
                    student.getAttendancePercentage(), overallGrade, student.getAcademicPercentage()
            );
        } else if (student.getAcademicPercentage() >= 80.0) {
            remarks = String.format(
                    "Commendable academic standing with %.1f%% attendance and %s grade (%.1f%% weighted score).",
                    student.getAttendancePercentage(), overallGrade, student.getAcademicPercentage()
            );
        } else {
            remarks = String.format(
                    "Satisfactory attendance (%.1f%%). Current grade is %s (%.1f%%). Focus on internal tests and lab viva for higher percentile.",
                    student.getAttendancePercentage(), overallGrade, student.getAcademicPercentage()
            );
        }
        report.setRemarks(remarks);
        return report;
    }
}
