package com.tracker.service;

import com.tracker.exception.StudentNotFoundException;
import com.tracker.model.AcademicClass;
import com.tracker.model.Department;
import com.tracker.model.Faculty;
import com.tracker.model.Staff;
import com.tracker.model.Student;
import com.tracker.repository.DataStore;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

// OOP: Plain Java Service for CRUD management of Departments, Classes, Students, Faculty, and Staff Directory
public class ManagementService {
    private final DataStore dataStore;
    private final AcademicService academicService;
    private final AtomicInteger idSequence = new AtomicInteger(500);

    public ManagementService(DataStore dataStore, AcademicService academicService) {
        this.dataStore = dataStore;
        this.academicService = academicService;
    }

    public List<Department> getAllDepartments() {
        return dataStore.getDepartments().values().stream()
                .sorted(Comparator.comparing(Department::getCode))
                .collect(Collectors.toList());
    }

    public Department saveDepartment(Department input) {
        String id = (input.getId() == null || input.getId().isBlank())
                ? "DEPT-" + input.getCode().toUpperCase().replace("&", "")
                : input.getId().trim();
        Department dept = new Department(id, input.getCode(), input.getName(), input.getHeadOfDepartment());
        dataStore.getDepartments().put(dept.getId(), dept);
        dataStore.markDirty();
        return dept;
    }

    public void deleteDepartment(String departmentId) {
        if (dataStore.getDepartments().remove(departmentId) == null) {
            throw new IllegalArgumentException("Department not found: " + departmentId);
        }
        dataStore.markDirty();
    }

    public List<AcademicClass> getAllClasses() {
        return dataStore.getClasses().values().stream()
                .sorted(Comparator.comparing(AcademicClass::getName))
                .collect(Collectors.toList());
    }

    public AcademicClass saveClass(AcademicClass input) {
        if (!dataStore.getDepartments().containsKey(input.getDepartmentId())) {
            throw new IllegalArgumentException("Referenced department does not exist: " + input.getDepartmentId());
        }
        String id = (input.getId() == null || input.getId().isBlank())
                ? "CLS-" + idSequence.incrementAndGet()
                : input.getId().trim();
        AcademicClass academicClass = new AcademicClass(
                id, input.getName(), input.getDepartmentId(),
                input.getSemester(), input.getSection(), input.getSubjects()
        );
        dataStore.getClasses().put(academicClass.getId(), academicClass);
        dataStore.markDirty();
        return academicClass;
    }

    public void deleteClass(String classId) {
        if (dataStore.getClasses().remove(classId) == null) {
            throw new IllegalArgumentException("Class not found: " + classId);
        }
        dataStore.markDirty();
    }

    public List<Student> getAllStudents() {
        List<Student> students = new ArrayList<>(dataStore.getStudents().values());
        for (Student student : students) {
            academicService.applyGradingContext(student);
        }
        students.sort(Comparator.comparing(Student::getRollNumber));
        return students;
    }

    public Student getStudentById(String studentId) {
        Student student = dataStore.getStudents().get(studentId);
        if (student == null) {
            throw new StudentNotFoundException(studentId);
        }
        academicService.applyGradingContext(student);
        return student;
    }

    public Student createStudent(Student input) {
        validateClassAndDepartment(input.getDepartmentId(), input.getClassId());
        String id = (input.getId() == null || input.getId().isBlank())
                ? "STU-" + idSequence.incrementAndGet()
                : input.getId().trim();
        String password = (input.getPassword() == null || input.getPassword().isBlank())
                ? "student123"
                : input.getPassword();
        Student student = new Student(
                id, input.getName(), input.getEmail(), password,
                input.getRollNumber(), input.getDepartmentId(), input.getClassId(), input.getSemester()
        );
        student.setAttendancePercentage(input.getAttendancePercentage());
        student.setAcademicPercentage(input.getAcademicPercentage());
        dataStore.getStudents().put(student.getId(), student);
        academicService.applyGradingContext(student);
        dataStore.markDirty();
        return student;
    }

    public Student updateStudent(String studentId, Student input) {
        Student existing = dataStore.getStudents().get(studentId);
        if (existing == null) {
            throw new StudentNotFoundException(studentId);
        }
        validateClassAndDepartment(input.getDepartmentId(), input.getClassId());
        existing.setName(input.getName());
        existing.setEmail(input.getEmail());
        if (input.getPassword() != null && !input.getPassword().isBlank()) {
            existing.setPassword(input.getPassword());
        }
        existing.setRollNumber(input.getRollNumber());
        existing.setDepartmentId(input.getDepartmentId());
        existing.setClassId(input.getClassId());
        existing.setSemester(input.getSemester());
        academicService.applyGradingContext(existing);
        dataStore.markDirty();
        return existing;
    }

    public void deleteStudent(String studentId) {
        if (dataStore.getStudents().remove(studentId) == null) {
            throw new StudentNotFoundException(studentId);
        }
        synchronized (dataStore.getAttendanceRecords()) {
            dataStore.getAttendanceRecords().removeIf(r -> studentId.equals(r.getStudentId()));
        }
        synchronized (dataStore.getAssessments()) {
            dataStore.getAssessments().removeIf(a -> studentId.equals(a.getStudentId()));
        }
        dataStore.markDirty();
    }

    public List<Faculty> getAllFaculty() {
        return dataStore.getFaculty().values().stream()
                .sorted(Comparator.comparing(Faculty::getName))
                .collect(Collectors.toList());
    }

    public Faculty saveFaculty(Faculty input) {
        if (!dataStore.getDepartments().containsKey(input.getDepartmentId())) {
            throw new IllegalArgumentException("Referenced department does not exist: " + input.getDepartmentId());
        }
        String id = (input.getId() == null || input.getId().isBlank())
                ? "FAC-" + idSequence.incrementAndGet()
                : input.getId().trim();
        String password = (input.getPassword() == null || input.getPassword().isBlank())
                ? "faculty123"
                : input.getPassword();
        Faculty faculty = new Faculty(
                id, input.getName(), input.getEmail(), password,
                input.getDepartmentId(), input.getDesignation(),
                input.getAssignedClassIds(), input.getSubjects()
        );
        dataStore.getFaculty().put(faculty.getId(), faculty);
        dataStore.getStaffMembers().put(faculty.getId(), faculty);
        dataStore.markDirty();
        return faculty;
    }

    public void deleteFaculty(String facultyId) {
        if (dataStore.getFaculty().remove(facultyId) == null && dataStore.getStaffMembers().remove(facultyId) == null) {
            throw new IllegalArgumentException("Faculty not found: " + facultyId);
        }
        dataStore.getStaffMembers().remove(facultyId);
        dataStore.markDirty();
    }

    public List<Map<String, Object>> getAllStaffDirectory() {
        return dataStore.getStaffMembers().values().stream()
                .sorted(Comparator.comparing(Staff::getRoleTitle).thenComparing(Staff::getName))
                .map(this::toStaffDto)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStaffByDepartment(String departmentId) {
        if (!dataStore.getDepartments().containsKey(departmentId)) {
            throw new IllegalArgumentException("Department not found: " + departmentId);
        }
        return dataStore.getStaffMembers().values().stream()
                .filter(staff -> departmentId.equals(staff.getDepartmentId())
                        || staff.getOverseenDepartmentIds().contains(departmentId))
                .sorted(Comparator.comparingInt(this::staffOrderWeight).thenComparing(Staff::getName))
                .map(this::toStaffDto)
                .collect(Collectors.toList());
    }

    private int staffOrderWeight(Staff staff) {
        return switch (staff.getRoleTitle()) {
            case "Dean" -> 1;
            case "Head of Department" -> 2;
            case "Academic Coordinator" -> 3;
            case "Exam Cell Coordinator" -> 4;
            case "Class Advisor" -> 5;
            case "Lab Instructor" -> 6;
            default -> 7;
        };
    }

    private Map<String, Object> toStaffDto(Staff staff) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", staff.getId());
        dto.put("name", staff.getName());
        dto.put("email", staff.getEmail());
        dto.put("departmentId", staff.getDepartmentId());
        dto.put("overseenDepartmentIds", staff.getOverseenDepartmentIds());
        dto.put("designation", staff.getDesignation());
        // OOP: Runtime Polymorphism - calls overridden getRoleTitle() & getPermissions()
        dto.put("roleTitle", staff.getRoleTitle());
        dto.put("permissions", staff.getPermissions());
        dto.put("subjects", staff.getSubjects());
        dto.put("assignedClassIds", staff.getAssignedClassIds());
        dto.put("dashboardSummary", staff.getDashboardSummary());
        return dto;
    }

    private void validateClassAndDepartment(String departmentId, String classId) {
        if (!dataStore.getDepartments().containsKey(departmentId)) {
            throw new IllegalArgumentException("Department not found: " + departmentId);
        }
        if (!dataStore.getClasses().containsKey(classId)) {
            throw new IllegalArgumentException("Class not found: " + classId);
        }
    }
}
