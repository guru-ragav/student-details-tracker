package com.tracker.service;

import com.tracker.exception.InvalidMarksException;
import com.tracker.exception.StudentNotFoundException;
import com.tracker.model.AcademicClass;
import com.tracker.model.Assessment;
import com.tracker.model.Assignment;
import com.tracker.model.InternalTest;
import com.tracker.model.LabRecord;
import com.tracker.model.Student;
import com.tracker.report.AbsoluteGrading;
import com.tracker.report.GradingStrategy;
import com.tracker.report.RelativeGrading;
import com.tracker.repository.DataStore;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

// OOP: Plain Java Service with overloaded calculateAverage() methods, Strategy selection, and Exam Cell verification
public class AcademicService {
    private final DataStore dataStore;

    public AcademicService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public GradingStrategy getActiveGradingStrategy() {
        if ("RELATIVE".equalsIgnoreCase(dataStore.getActiveGradingStrategyName())) {
            return new RelativeGrading();
        }
        return new AbsoluteGrading();
    }

    public void setGradingStrategyName(String strategyName) {
        if ("RELATIVE".equalsIgnoreCase(strategyName)) {
            dataStore.setActiveGradingStrategyName("RELATIVE");
        } else {
            dataStore.setActiveGradingStrategyName("ABSOLUTE");
        }
    }

    public void applyGradingContext(Student student) {
        List<Double> cohort = dataStore.getStudents().values().stream()
                .filter(s -> student.getClassId().equals(s.getClassId()))
                .map(Student::getAcademicPercentage)
                .collect(Collectors.toList());
        student.setCohortPercentages(cohort);
        student.setGradingStrategy(getActiveGradingStrategy());
    }

    // OOP: Compile-time Polymorphism (Overload 1: calculate average from assessment list)
    public double calculateAverage(List<Assessment> assessments) {
        if (assessments == null || assessments.isEmpty()) {
            return 0.0;
        }
        double sum = 0.0;
        for (Assessment assessment : assessments) {
            sum += assessment.getPercentageScore();
        }
        return Math.round((sum / assessments.size()) * 100.0) / 100.0;
    }

    // OOP: Compile-time Polymorphism (Overload 2: calculate weighted average for student & subject)
    public double calculateAverage(String studentId, String subject) {
        List<Assessment> matches = dataStore.getAssessmentsSnapshot().stream()
                .filter(a -> studentId.equals(a.getStudentId()) && subject.equalsIgnoreCase(a.getSubject()))
                .collect(Collectors.toList());
        if (matches.isEmpty()) {
            return 0.0;
        }
        double weightedTotal = matches.stream()
                .mapToDouble(Assessment::calculateWeightedScore)
                .sum();
        return Math.round(weightedTotal * 100.0) / 100.0;
    }

    // OOP: Compile-time Polymorphism (Overload 3: calculate overall class average)
    public double calculateAverage(String classId) {
        List<Student> classStudents = dataStore.getStudents().values().stream()
                .filter(s -> classId.equals(s.getClassId()))
                .collect(Collectors.toList());
        if (classStudents.isEmpty()) {
            return 0.0;
        }
        double sum = classStudents.stream()
                .mapToDouble(Student::getAcademicPercentage)
                .sum();
        return Math.round((sum / classStudents.size()) * 100.0) / 100.0;
    }

    public List<Assessment> getAssessmentsForClassAndSubject(String classId, String subject) {
        return dataStore.getAssessmentsSnapshot().stream()
                .filter(a -> classId.equals(a.getClassId()) && subject.equalsIgnoreCase(a.getSubject()))
                .sorted(Comparator.comparing(Assessment::getStudentId).thenComparing(Assessment::getAssessmentCategory))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getDepartmentAssessments(String departmentId) {
        Set<String> deptClassIds = dataStore.getClasses().values().stream()
                .filter(c -> departmentId.equals(c.getDepartmentId()))
                .map(AcademicClass::getId)
                .collect(Collectors.toSet());

        return dataStore.getAssessmentsSnapshot().stream()
                .filter(a -> deptClassIds.contains(a.getClassId()))
                .sorted(Comparator.comparing(Assessment::getClassId)
                        .thenComparing(Assessment::getSubject)
                        .thenComparing(Assessment::getStudentId))
                .map(a -> {
                    Student stu = dataStore.getStudents().get(a.getStudentId());
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", a.getId());
                    row.put("studentId", a.getStudentId());
                    row.put("studentName", stu != null ? stu.getName() : a.getStudentId());
                    row.put("rollNumber", stu != null ? stu.getRollNumber() : "");
                    row.put("classId", a.getClassId());
                    row.put("subject", a.getSubject());
                    row.put("category", a.getAssessmentCategory());
                    row.put("marksObtained", a.getMarksObtained());
                    row.put("maxMarks", a.getMaxMarks());
                    row.put("weightedScore", a.calculateWeightedScore());
                    row.put("verifiedByExamCell", a.isVerifiedByExamCell());
                    row.put("verifiedBy", a.getVerifiedBy());
                    return row;
                })
                .collect(Collectors.toList());
    }

    public int verifyDepartmentAssessments(List<String> assessmentIds, String verifierId) {
        if (assessmentIds == null || assessmentIds.isEmpty()) {
            return 0;
        }
        Set<String> idSet = Set.copyOf(assessmentIds);
        int updatedCount = 0;
        synchronized (dataStore.getAssessments()) {
            for (Assessment assessment : dataStore.getAssessments()) {
                if (idSet.contains(assessment.getId())) {
                    assessment.setVerifiedByExamCell(true);
                    assessment.setVerifiedBy(verifierId);
                    updatedCount++;
                }
            }
        }
        if (updatedCount > 0) {
            dataStore.markDirty();
        }
        return updatedCount;
    }

    public List<Assessment> getAssessmentsForStudent(String studentId) {
        if (!dataStore.getStudents().containsKey(studentId)) {
            throw new StudentNotFoundException(studentId);
        }
        return dataStore.getAssessmentsSnapshot().stream()
                .filter(a -> studentId.equals(a.getStudentId()))
                .sorted(Comparator.comparing(Assessment::getSubject).thenComparing(Assessment::getAssessmentCategory))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStudentSubjectMarksSummary(String studentId) {
        Student student = dataStore.getStudents().get(studentId);
        if (student == null) {
            throw new StudentNotFoundException(studentId);
        }
        applyGradingContext(student);
        AcademicClass academicClass = dataStore.getClasses().get(student.getClassId());
        List<String> subjects = academicClass != null ? academicClass.getSubjects() : List.of();
        List<Assessment> studentAssessments = getAssessmentsForStudent(studentId);

        List<Map<String, Object>> summaryList = new ArrayList<>();
        for (String subject : subjects) {
            List<Assessment> subAssessments = studentAssessments.stream()
                    .filter(a -> subject.equalsIgnoreCase(a.getSubject()))
                    .collect(Collectors.toList());

            double internalTest = 0.0;
            double assignment = 0.0;
            double labRecord = 0.0;
            for (Assessment assessment : subAssessments) {
                switch (assessment.getAssessmentCategory()) {
                    case "INTERNAL_TEST" -> internalTest = assessment.getMarksObtained();
                    case "ASSIGNMENT" -> assignment = assessment.getMarksObtained();
                    case "LAB_RECORD" -> labRecord = assessment.getMarksObtained();
                    default -> {
                    }
                }
            }
            double weightedTotal = calculateAverage(studentId, subject);
            String subjectGrade = getActiveGradingStrategy().assignGrade(weightedTotal, student.getCohortPercentages());

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("subject", subject);
            row.put("internalTestMarks", internalTest);
            row.put("assignmentMarks", assignment);
            row.put("labRecordMarks", labRecord);
            row.put("weightedTotal", weightedTotal);
            row.put("grade", subjectGrade);
            summaryList.add(row);
        }
        return summaryList;
    }

    public Assessment upsertAssessmentMark(String studentId, String classId, String subject,
                                           String category, double marksObtained, double maxMarks) {
        Student student = dataStore.getStudents().get(studentId);
        if (student == null) {
            throw new StudentNotFoundException(studentId);
        }
        if (marksObtained < 0 || marksObtained > maxMarks) {
            throw new InvalidMarksException(marksObtained, maxMarks);
        }

        Assessment updated;
        synchronized (dataStore.getAssessments()) {
            Assessment existing = dataStore.getAssessments().stream()
                    .filter(a -> a.getStudentId().equals(studentId)
                            && a.getSubject().equalsIgnoreCase(subject)
                            && a.getAssessmentCategory().equalsIgnoreCase(category))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                existing.setMaxMarks(maxMarks);
                existing.setMarksObtained(marksObtained);
                existing.setAssessedDate(LocalDate.now());
                existing.setVerifiedByExamCell(false);
                existing.setVerifiedBy("");
                updated = existing;
            } else {
                String id = "ASM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                updated = switch (category.toUpperCase()) {
                    case "ASSIGNMENT" -> new Assignment(
                            id, studentId, classId, subject, "Technical Assignment",
                            maxMarks, marksObtained, LocalDate.now(), true, 0.25
                    );
                    case "LAB_RECORD" -> new LabRecord(
                            id, studentId, classId, subject, "Lab Record & Viva",
                            maxMarks, marksObtained, LocalDate.now(), 10, 0.25
                    );
                    default -> new InternalTest(
                            id, studentId, classId, subject, "Internal Assessment Test",
                            maxMarks, marksObtained, LocalDate.now(), 1, 0.50
                    );
                };
                dataStore.getAssessments().add(updated);
            }
        }

        recalculateStudentAcademicPercentage(student);
        dataStore.markDirty();
        return updated;
    }

    private void recalculateStudentAcademicPercentage(Student student) {
        AcademicClass academicClass = dataStore.getClasses().get(student.getClassId());
        if (academicClass == null || academicClass.getSubjects().isEmpty()) {
            return;
        }
        double total = 0.0;
        for (String subject : academicClass.getSubjects()) {
            total += calculateAverage(student.getId(), subject);
        }
        double overall = total / academicClass.getSubjects().size();
        student.setAcademicPercentage(overall);
        applyGradingContext(student);
    }
}
