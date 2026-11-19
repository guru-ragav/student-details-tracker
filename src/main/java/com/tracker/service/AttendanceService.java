package com.tracker.service;

import com.tracker.exception.InvalidAttendanceException;
import com.tracker.exception.StudentNotFoundException;
import com.tracker.model.AcademicClass;
import com.tracker.model.AttendanceRecord;
import com.tracker.model.AttendanceStatus;
import com.tracker.model.Student;
import com.tracker.repository.DataStore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

// OOP: Multithreading (ReentrantReadWriteLock) & Compile-time Polymorphism (Overloaded markAttendance methods)
public class AttendanceService {
    private final DataStore dataStore;
    private final ReentrantReadWriteLock readWriteLock = new ReentrantReadWriteLock(true);

    public AttendanceService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    // OOP: Compile-time Polymorphism (Overload 1: mark single student attendance)
    public AttendanceRecord markAttendance(String studentId, String subject, LocalDate date,
                                           AttendanceStatus status, String markedBy) {
        readWriteLock.writeLock().lock();
        try {
            Student student = dataStore.getStudents().get(studentId);
            if (student == null) {
                throw new StudentNotFoundException(studentId);
            }
            AttendanceRecord saved = upsertRecord(student, subject, date, status, markedBy);
            recalculateStudentAttendance(studentId);
            dataStore.markDirty();
            return saved;
        } finally {
            readWriteLock.writeLock().unlock();
        }
    }

    // OOP: Compile-time Polymorphism (Overload 2: mark attendance grid for a class via Map<studentId, status>)
    public List<AttendanceRecord> markAttendance(String classId, String subject, LocalDate date,
                                                 Map<String, AttendanceStatus> studentStatuses, String markedBy) {
        if (studentStatuses == null || studentStatuses.isEmpty()) {
            throw new InvalidAttendanceException("Attendance status map cannot be empty.");
        }
        readWriteLock.writeLock().lock();
        try {
            if (!dataStore.getClasses().containsKey(classId)) {
                throw new IllegalArgumentException("Class not found: " + classId);
            }
            List<AttendanceRecord> updated = new ArrayList<>();
            for (Map.Entry<String, AttendanceStatus> entry : studentStatuses.entrySet()) {
                Student student = dataStore.getStudents().get(entry.getKey());
                if (student == null) {
                    throw new StudentNotFoundException(entry.getKey());
                }
                updated.add(upsertRecord(student, subject, date, entry.getValue(), markedBy));
                recalculateStudentAttendance(student.getId());
            }
            dataStore.markDirty();
            return updated;
        } finally {
            readWriteLock.writeLock().unlock();
        }
    }

    // OOP: Compile-time Polymorphism (Overload 3: bulk mark all students in a class with one status)
    public List<AttendanceRecord> markAttendance(String classId, String subject, LocalDate date,
                                                 AttendanceStatus bulkStatus, String markedBy) {
        readWriteLock.writeLock().lock();
        try {
            AcademicClass academicClass = dataStore.getClasses().get(classId);
            if (academicClass == null) {
                throw new IllegalArgumentException("Class not found: " + classId);
            }
            List<Student> classStudents = dataStore.getStudents().values().stream()
                    .filter(s -> classId.equals(s.getClassId()))
                    .collect(Collectors.toList());

            List<AttendanceRecord> updated = new ArrayList<>();
            for (Student student : classStudents) {
                updated.add(upsertRecord(student, subject, date, bulkStatus, markedBy));
                recalculateStudentAttendance(student.getId());
            }
            dataStore.markDirty();
            return updated;
        } finally {
            readWriteLock.writeLock().unlock();
        }
    }

    public List<AttendanceRecord> getClassAttendanceForDate(String classId, String subject, LocalDate date) {
        readWriteLock.readLock().lock();
        try {
            return dataStore.getAttendanceSnapshot().stream()
                    .filter(r -> classId.equals(r.getClassId())
                            && subject.equalsIgnoreCase(r.getSubject())
                            && date.equals(r.getDate()))
                    .sorted(Comparator.comparing(AttendanceRecord::getStudentId))
                    .collect(Collectors.toList());
        } finally {
            readWriteLock.readLock().unlock();
        }
    }

    public List<AttendanceRecord> getStudentAttendanceRecords(String studentId) {
        readWriteLock.readLock().lock();
        try {
            if (!dataStore.getStudents().containsKey(studentId)) {
                throw new StudentNotFoundException(studentId);
            }
            return dataStore.getAttendanceSnapshot().stream()
                    .filter(r -> studentId.equals(r.getStudentId()))
                    .sorted(Comparator.comparing(AttendanceRecord::getDate).reversed())
                    .collect(Collectors.toList());
        } finally {
            readWriteLock.readLock().unlock();
        }
    }

    public List<Map<String, Object>> getStudentSubjectAttendanceSummary(String studentId) {
        readWriteLock.readLock().lock();
        try {
            Student student = dataStore.getStudents().get(studentId);
            if (student == null) {
                throw new StudentNotFoundException(studentId);
            }
            AcademicClass academicClass = dataStore.getClasses().get(student.getClassId());
            List<String> subjects = academicClass != null ? academicClass.getSubjects() : List.of();
            List<AttendanceRecord> records = dataStore.getAttendanceSnapshot().stream()
                    .filter(r -> studentId.equals(r.getStudentId()))
                    .collect(Collectors.toList());

            List<Map<String, Object>> summaries = new ArrayList<>();
            for (String subject : subjects) {
                List<AttendanceRecord> subRecords = records.stream()
                        .filter(r -> subject.equalsIgnoreCase(r.getSubject()))
                        .collect(Collectors.toList());
                long present = subRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
                long absent = subRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
                long pending = subRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PENDING).count();
                long decided = present + absent;
                double pct = decided == 0 ? 100.0 : Math.round((present * 10000.0) / decided) / 100.0;

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("subject", subject);
                item.put("present", present);
                item.put("absent", absent);
                item.put("pending", pending);
                item.put("totalSessions", subRecords.size());
                item.put("percentage", pct);
                item.put("shortage", pct < Student.MINIMUM_REQUIRED_ATTENDANCE);
                summaries.add(item);
            }
            return summaries;
        } finally {
            readWriteLock.readLock().unlock();
        }
    }

    private AttendanceRecord upsertRecord(Student student, String subject, LocalDate date,
                                          AttendanceStatus status, String markedBy) {
        if (subject == null || subject.isBlank() || date == null || status == null) {
            throw new InvalidAttendanceException("Subject, date, and attendance status are required.");
        }
        synchronized (dataStore.getAttendanceRecords()) {
            for (AttendanceRecord existing : dataStore.getAttendanceRecords()) {
                if (existing.getStudentId().equals(student.getId())
                        && existing.getSubject().equalsIgnoreCase(subject.trim())
                        && existing.getDate().equals(date)) {
                    existing.setStatus(status);
                    existing.setMarkedBy(markedBy);
                    existing.setMarkedAt(LocalDateTime.now());
                    return existing;
                }
            }
            AttendanceRecord created = new AttendanceRecord(
                    "ATT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    student.getId(),
                    student.getClassId(),
                    subject.trim(),
                    date,
                    status,
                    markedBy,
                    LocalDateTime.now(),
                    ""
            );
            dataStore.getAttendanceRecords().add(created);
            return created;
        }
    }

    private void recalculateStudentAttendance(String studentId) {
        Student student = dataStore.getStudents().get(studentId);
        if (student == null) {
            return;
        }
        List<AttendanceRecord> records = dataStore.getAttendanceSnapshot().stream()
                .filter(r -> studentId.equals(r.getStudentId()))
                .collect(Collectors.toList());
        long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
        long decided = present + absent;
        double pct = decided == 0 ? 100.0 : (present * 100.0) / decided;
        student.setAttendancePercentage(pct);
    }
}
