package com.tracker.controller;

import com.tracker.model.Assessment;
import com.tracker.service.AcademicService;
import com.tracker.service.TrackerContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {
    private final AcademicService academicService = TrackerContext.getInstance().getAcademicService();

    @GetMapping("/class")
    public List<Assessment> getClassAssessments(
            @RequestParam String classId,
            @RequestParam String subject) {
        return academicService.getAssessmentsForClassAndSubject(classId, subject);
    }

    @GetMapping("/department/{departmentId}")
    public List<Map<String, Object>> getDepartmentAssessments(@PathVariable String departmentId) {
        return academicService.getDepartmentAssessments(departmentId);
    }

    @GetMapping("/student/{studentId}")
    public List<Assessment> getStudentAssessments(@PathVariable String studentId) {
        return academicService.getAssessmentsForStudent(studentId);
    }

    @GetMapping("/student/{studentId}/summary")
    public List<Map<String, Object>> getStudentMarksSummary(@PathVariable String studentId) {
        return academicService.getStudentSubjectMarksSummary(studentId);
    }

    @PostMapping("/mark")
    public Assessment saveAssessmentMark(@RequestBody Map<String, Object> payload) {
        String studentId = String.valueOf(payload.get("studentId"));
        String classId = String.valueOf(payload.get("classId"));
        String subject = String.valueOf(payload.get("subject"));
        String category = String.valueOf(payload.get("category"));
        double marksObtained = Double.parseDouble(String.valueOf(payload.get("marksObtained")));
        double maxMarks = Double.parseDouble(String.valueOf(payload.get("maxMarks")));
        return academicService.upsertAssessmentMark(studentId, classId, subject, category, marksObtained, maxMarks);
    }

    @PostMapping("/verify")
    @SuppressWarnings("unchecked")
    public Map<String, Object> verifyAssessments(@RequestBody Map<String, Object> payload) {
        List<String> assessmentIds = (List<String>) payload.get("assessmentIds");
        String verifierId = String.valueOf(payload.getOrDefault("verifierId", "EXAM-CELL"));
        int verifiedCount = academicService.verifyDepartmentAssessments(assessmentIds, verifierId);
        return Map.of("verifiedCount", verifiedCount, "verifiedBy", verifierId);
    }
}
