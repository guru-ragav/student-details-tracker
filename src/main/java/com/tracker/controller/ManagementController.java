package com.tracker.controller;

import com.tracker.model.AcademicClass;
import com.tracker.model.Department;
import com.tracker.model.Faculty;
import com.tracker.model.Student;
import com.tracker.service.AcademicService;
import com.tracker.service.ManagementService;
import com.tracker.service.TrackerContext;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ManagementController {
    private final ManagementService managementService = TrackerContext.getInstance().getManagementService();
    private final AcademicService academicService = TrackerContext.getInstance().getAcademicService();

    @GetMapping("/overview")
    public Map<String, Object> getInstitutionalOverview() {
        List<Department> departments = managementService.getAllDepartments();
        List<AcademicClass> classes = managementService.getAllClasses();
        List<Student> students = managementService.getAllStudents();
        List<Map<String, Object>> allStaff = managementService.getAllStaffDirectory();

        double avgAttendance = students.stream().mapToDouble(Student::getAttendancePercentage).average().orElse(0.0);
        double avgAcademic = students.stream().mapToDouble(Student::getAcademicPercentage).average().orElse(0.0);
        long shortageCount = students.stream().filter(Student::hasAttendanceShortage).count();
        long passCount = students.stream().filter(s -> s.getAcademicPercentage() >= 40.0).count();
        double passPct = students.isEmpty() ? 0.0 : (passCount * 100.0) / students.size();

        List<Map<String, Object>> departmentCards = new ArrayList<>();
        for (Department dept : departments) {
            List<Student> deptStudents = students.stream()
                    .filter(s -> dept.getId().equals(s.getDepartmentId()))
                    .collect(Collectors.toList());
            long deptClasses = classes.stream().filter(c -> dept.getId().equals(c.getDepartmentId())).count();
            int deptStaffCount = managementService.getStaffByDepartment(dept.getId()).size();
            double deptAvgAtt = deptStudents.stream().mapToDouble(Student::getAttendancePercentage).average().orElse(0.0);
            double deptAvgMarks = deptStudents.stream().mapToDouble(Student::getAcademicPercentage).average().orElse(0.0);
            long deptShortage = deptStudents.stream().filter(Student::hasAttendanceShortage).count();

            Map<String, Object> card = new LinkedHashMap<>();
            card.put("id", dept.getId());
            card.put("code", dept.getCode());
            card.put("name", dept.getName());
            card.put("headOfDepartment", dept.getHeadOfDepartment());
            card.put("classCount", deptClasses);
            card.put("studentCount", deptStudents.size());
            card.put("staffCount", deptStaffCount);
            card.put("averageAttendance", Math.round(deptAvgAtt * 100.0) / 100.0);
            card.put("averageAcademic", Math.round(deptAvgMarks * 100.0) / 100.0);
            card.put("shortageCount", deptShortage);
            departmentCards.add(card);
        }

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("departmentCount", departments.size());
        overview.put("classCount", classes.size());
        overview.put("studentCount", students.size());
        overview.put("facultyCount", allStaff.size());
        overview.put("averageAttendance", Math.round(avgAttendance * 100.0) / 100.0);
        overview.put("averageAcademic", Math.round(avgAcademic * 100.0) / 100.0);
        overview.put("passPercentage", Math.round(passPct * 100.0) / 100.0);
        overview.put("shortageCount", shortageCount);
        overview.put("gradingStrategy", TrackerContext.getInstance().getDataStore().getActiveGradingStrategyName());
        overview.put("departmentCards", departmentCards);
        return overview;
    }

    @GetMapping("/departments")
    public List<Department> listDepartments() {
        return managementService.getAllDepartments();
    }

    @GetMapping("/departments/{id}/staff")
    public List<Map<String, Object>> listDepartmentStaff(@PathVariable String id) {
        return managementService.getStaffByDepartment(id);
    }

    @GetMapping("/staff")
    public List<Map<String, Object>> listAllStaff() {
        return managementService.getAllStaffDirectory();
    }

    @PostMapping("/departments")
    public Department createDepartment(@RequestBody Department department) {
        return managementService.saveDepartment(department);
    }

    @PutMapping("/departments/{id}")
    public Department updateDepartment(@PathVariable String id, @RequestBody Department department) {
        department.setId(id);
        return managementService.saveDepartment(department);
    }

    @DeleteMapping("/departments/{id}")
    public Map<String, String> deleteDepartment(@PathVariable String id) {
        managementService.deleteDepartment(id);
        return Map.of("status", "deleted", "id", id);
    }

    @GetMapping("/classes")
    public List<AcademicClass> listClasses() {
        return managementService.getAllClasses();
    }

    @PostMapping("/classes")
    public AcademicClass createClass(@RequestBody AcademicClass academicClass) {
        return managementService.saveClass(academicClass);
    }

    @PutMapping("/classes/{id}")
    public AcademicClass updateClass(@PathVariable String id, @RequestBody AcademicClass academicClass) {
        academicClass.setId(id);
        return managementService.saveClass(academicClass);
    }

    @DeleteMapping("/classes/{id}")
    public Map<String, String> deleteClass(@PathVariable String id) {
        managementService.deleteClass(id);
        return Map.of("status", "deleted", "id", id);
    }

    @GetMapping("/students")
    public List<Student> listStudents() {
        return managementService.getAllStudents();
    }

    @GetMapping("/students/{id}")
    public Student getStudent(@PathVariable String id) {
        return managementService.getStudentById(id);
    }

    @PostMapping("/students")
    public Student createStudent(@RequestBody Student student) {
        return managementService.createStudent(student);
    }

    @PutMapping("/students/{id}")
    public Student updateStudent(@PathVariable String id, @RequestBody Student student) {
        return managementService.updateStudent(id, student);
    }

    @DeleteMapping("/students/{id}")
    public Map<String, String> deleteStudent(@PathVariable String id) {
        managementService.deleteStudent(id);
        return Map.of("status", "deleted", "id", id);
    }

    @GetMapping("/faculty")
    public List<Faculty> listFaculty() {
        return managementService.getAllFaculty();
    }

    @PostMapping("/faculty")
    public Faculty createFaculty(@RequestBody Faculty faculty) {
        return managementService.saveFaculty(faculty);
    }

    @PutMapping("/faculty/{id}")
    public Faculty updateFaculty(@PathVariable String id, @RequestBody Faculty faculty) {
        faculty.setId(id);
        return managementService.saveFaculty(faculty);
    }

    @DeleteMapping("/faculty/{id}")
    public Map<String, String> deleteFaculty(@PathVariable String id) {
        managementService.deleteFaculty(id);
        return Map.of("status", "deleted", "id", id);
    }

    @PutMapping("/system/grading-strategy")
    public Map<String, String> updateGradingStrategy(@RequestBody Map<String, String> payload) {
        String strategy = payload.getOrDefault("strategy", "ABSOLUTE");
        academicService.setGradingStrategyName(strategy);
        return Map.of("gradingStrategy", TrackerContext.getInstance().getDataStore().getActiveGradingStrategyName());
    }

    @PostMapping("/system/save")
    public Map<String, String> triggerManualSave() {
        TrackerContext.getInstance().getAutoSaveDaemon().saveNow();
        return Map.of("status", "saved", "message", "All collections persisted to /data JSON files.");
    }
}
