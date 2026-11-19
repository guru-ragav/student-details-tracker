package com.tracker.controller;

import com.tracker.model.AttendanceRecord;
import com.tracker.model.AttendanceStatus;
import com.tracker.service.AttendanceService;
import com.tracker.service.TrackerContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    private final AttendanceService attendanceService = TrackerContext.getInstance().getAttendanceService();

    @GetMapping("/class")
    public List<AttendanceRecord> getClassAttendance(
            @RequestParam String classId,
            @RequestParam String subject,
            @RequestParam String date) {
        return attendanceService.getClassAttendanceForDate(classId, subject, LocalDate.parse(date));
    }

    @PostMapping("/single")
    public AttendanceRecord markSingle(@RequestBody Map<String, String> payload) {
        String studentId = payload.get("studentId");
        String subject = payload.get("subject");
        LocalDate date = LocalDate.parse(payload.get("date"));
        AttendanceStatus status = AttendanceStatus.valueOf(payload.get("status").toUpperCase());
        String markedBy = payload.getOrDefault("markedBy", "FAC-201");
        return attendanceService.markAttendance(studentId, subject, date, status, markedBy);
    }

    @PostMapping("/grid")
    @SuppressWarnings("unchecked")
    public List<AttendanceRecord> markGrid(@RequestBody Map<String, Object> payload) {
        String classId = String.valueOf(payload.get("classId"));
        String subject = String.valueOf(payload.get("subject"));
        LocalDate date = LocalDate.parse(String.valueOf(payload.get("date")));
        String markedBy = String.valueOf(payload.getOrDefault("markedBy", "FAC-201"));

        Map<String, String> rawStatuses = (Map<String, String>) payload.get("statuses");
        Map<String, AttendanceStatus> statusMap = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : rawStatuses.entrySet()) {
            statusMap.put(entry.getKey(), AttendanceStatus.valueOf(entry.getValue().toUpperCase()));
        }
        return attendanceService.markAttendance(classId, subject, date, statusMap, markedBy);
    }

    @PostMapping("/bulk")
    public List<AttendanceRecord> markBulk(@RequestBody Map<String, String> payload) {
        String classId = payload.get("classId");
        String subject = payload.get("subject");
        LocalDate date = LocalDate.parse(payload.get("date"));
        AttendanceStatus status = AttendanceStatus.valueOf(payload.getOrDefault("status", "PRESENT").toUpperCase());
        String markedBy = payload.getOrDefault("markedBy", "FAC-201");
        return attendanceService.markAttendance(classId, subject, date, status, markedBy);
    }

    @GetMapping("/student/{studentId}")
    public List<AttendanceRecord> getStudentAttendance(@PathVariable String studentId) {
        return attendanceService.getStudentAttendanceRecords(studentId);
    }

    @GetMapping("/student/{studentId}/summary")
    public List<Map<String, Object>> getStudentSubjectSummary(@PathVariable String studentId) {
        return attendanceService.getStudentSubjectAttendanceSummary(studentId);
    }
}
