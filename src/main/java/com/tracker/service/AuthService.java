package com.tracker.service;

import com.tracker.exception.UnauthorizedAccessException;
import com.tracker.model.AcademicCoordinator;
import com.tracker.model.ClassAdvisor;
import com.tracker.model.Dean;
import com.tracker.model.ExamCellCoordinator;
import com.tracker.model.Faculty;
import com.tracker.model.HeadOfDepartment;
import com.tracker.model.LabInstructor;
import com.tracker.model.Person;
import com.tracker.model.Staff;
import com.tracker.model.Student;
import com.tracker.model.SubjectFaculty;
import com.tracker.model.UserRole;
import com.tracker.repository.DataStore;

import java.util.LinkedHashMap;
import java.util.Map;

// OOP: Plain Java Service handling polymorphic Person & Staff authentication
public class AuthService {
    private final DataStore dataStore;
    private final AcademicService academicService;

    public AuthService(DataStore dataStore, AcademicService academicService) {
        this.dataStore = dataStore;
        this.academicService = academicService;
    }

    public Map<String, Object> authenticate(String email, String password, UserRole role) {
        if (email == null || email.isBlank() || password == null || password.isBlank() || role == null) {
            throw new UnauthorizedAccessException("Role, email, and password are all required.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        Person matchedPerson = switch (role) {
            case ADMIN -> dataStore.getAdministrators().values().stream()
                    .filter(a -> a.getEmail().equalsIgnoreCase(normalizedEmail))
                    .findFirst()
                    .orElse(null);
            case STUDENT -> dataStore.getStudents().values().stream()
                    .filter(s -> s.getEmail().equalsIgnoreCase(normalizedEmail))
                    .findFirst()
                    .orElse(null);
            case DEAN -> findStaffByEmailAndType(normalizedEmail, Dean.class);
            case HOD -> findStaffByEmailAndType(normalizedEmail, HeadOfDepartment.class);
            case ACADEMIC_COORDINATOR -> findStaffByEmailAndType(normalizedEmail, AcademicCoordinator.class);
            case CLASS_ADVISOR -> findStaffByEmailAndType(normalizedEmail, ClassAdvisor.class);
            case EXAM_CELL_COORDINATOR -> findStaffByEmailAndType(normalizedEmail, ExamCellCoordinator.class);
            case FACULTY -> findFacultyByEmail(normalizedEmail);
        };

        if (matchedPerson == null || !matchedPerson.getPassword().equals(password)) {
            throw new UnauthorizedAccessException("Invalid credentials for selected role " + role.name() + ".");
        }

        if (matchedPerson instanceof Student student) {
            academicService.applyGradingContext(student);
        }

        Map<String, Object> session = new LinkedHashMap<>();
        session.put("id", matchedPerson.getId());
        session.put("name", matchedPerson.getName());
        session.put("email", matchedPerson.getEmail());
        session.put("role", role.name());
        // OOP: Runtime Polymorphism - calls overridden getDashboardSummary()
        session.put("dashboardSummary", matchedPerson.getDashboardSummary());
        if (matchedPerson instanceof Staff staff) {
            session.put("roleTitle", staff.getRoleTitle());
            session.put("permissions", staff.getPermissions());
        }
        session.put("profile", matchedPerson);
        return session;
    }

    private Staff findStaffByEmailAndType(String email, Class<? extends Staff> staffType) {
        return dataStore.getStaffMembers().values().stream()
                .filter(staffType::isInstance)
                .filter(s -> s.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
    }

    private Staff findFacultyByEmail(String email) {
        Staff staffMatch = dataStore.getStaffMembers().values().stream()
                .filter(s -> s instanceof SubjectFaculty || s instanceof LabInstructor || s instanceof Faculty)
                .filter(s -> s.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
        if (staffMatch != null) {
            return staffMatch;
        }
        return dataStore.getFaculty().values().stream()
                .filter(f -> f.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
    }
}
