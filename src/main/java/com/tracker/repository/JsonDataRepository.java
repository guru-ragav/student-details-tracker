package com.tracker.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tracker.exception.DataPersistenceException;
import com.tracker.model.AcademicClass;
import com.tracker.model.Administrator;
import com.tracker.model.Assessment;
import com.tracker.model.AttendanceRecord;
import com.tracker.model.Department;
import com.tracker.model.Faculty;
import com.tracker.model.Person;
import com.tracker.model.Staff;
import com.tracker.model.Student;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

// OOP: Repository layer persisting in-memory collections to /data/*.json files with seed versioning
public class JsonDataRepository {
    public static final String SEED_VERSION = "2.0-south-indian-7depts-full-staff";

    private final Path dataDirectory;
    private final ObjectMapper objectMapper;

    public JsonDataRepository() {
        this(Paths.get("data"));
    }

    public JsonDataRepository(Path dataDirectory) {
        this.dataDirectory = dataDirectory;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public boolean hasCurrentVersionData() {
        Path versionFile = dataDirectory.resolve("seed-version.txt");
        if (!Files.exists(versionFile)) {
            return false;
        }
        try {
            String current = Files.readString(versionFile, StandardCharsets.UTF_8).trim();
            if (!SEED_VERSION.equals(current)) {
                return false;
            }
        } catch (IOException ex) {
            return false;
        }

        return Files.exists(dataDirectory.resolve("departments.json"))
                && Files.exists(dataDirectory.resolve("classes.json"))
                && Files.exists(dataDirectory.resolve("students.json"))
                && Files.exists(dataDirectory.resolve("staff.json"))
                && Files.exists(dataDirectory.resolve("admins.json"));
    }

    public synchronized void clearStaleDataFiles() {
        try {
            if (!Files.exists(dataDirectory)) {
                return;
            }
            String[] files = {
                    "departments.json", "classes.json", "students.json",
                    "faculty.json", "staff.json", "admins.json",
                    "attendance.json", "assessments.json", "seed-version.txt"
            };
            for (String file : files) {
                Files.deleteIfExists(dataDirectory.resolve(file));
            }
        } catch (IOException ex) {
            throw new DataPersistenceException("Failed to clear stale /data JSON files.", ex);
        }
    }

    public synchronized void saveAll(DataStore store) {
        try {
            if (!Files.exists(dataDirectory)) {
                Files.createDirectories(dataDirectory);
            }
            writeList("departments.json", new ArrayList<>(store.getDepartments().values()));
            writeList("classes.json", new ArrayList<>(store.getClasses().values()));
            writeList("students.json", new ArrayList<>(store.getStudents().values()));
            writeList("faculty.json", new ArrayList<>(store.getFaculty().values()));
            writePersonList("staff.json", new ArrayList<>(store.getStaffMembers().values()));
            writeList("admins.json", new ArrayList<>(store.getAdministrators().values()));
            writeList("attendance.json", store.getAttendanceSnapshot());
            writeList("assessments.json", store.getAssessmentsSnapshot());
            Files.writeString(dataDirectory.resolve("seed-version.txt"), SEED_VERSION, StandardCharsets.UTF_8);
            store.clearDirty();
        } catch (IOException ex) {
            throw new DataPersistenceException("Failed to persist tracker data to JSON files.", ex);
        }
    }

    public synchronized void loadAll(DataStore store) {
        try {
            List<Department> departments = readList("departments.json", new TypeReference<>() {});
            departments.forEach(d -> store.getDepartments().put(d.getId(), d));

            List<AcademicClass> classes = readList("classes.json", new TypeReference<>() {});
            classes.forEach(c -> store.getClasses().put(c.getId(), c));

            List<Student> students = readList("students.json", new TypeReference<>() {});
            students.forEach(s -> store.getStudents().put(s.getId(), s));

            List<Faculty> facultyList = readList("faculty.json", new TypeReference<>() {});
            facultyList.forEach(f -> store.getFaculty().put(f.getId(), f));

            List<Person> staffList = readList("staff.json", new TypeReference<>() {});
            for (Person person : staffList) {
                if (person instanceof Staff staff) {
                    store.getStaffMembers().put(staff.getId(), staff);
                }
            }

            List<Administrator> admins = readList("admins.json", new TypeReference<>() {});
            admins.forEach(a -> store.getAdministrators().put(a.getId(), a));

            List<AttendanceRecord> attendance = readList("attendance.json", new TypeReference<>() {});
            synchronized (store.getAttendanceRecords()) {
                store.getAttendanceRecords().clear();
                store.getAttendanceRecords().addAll(attendance);
            }

            List<Assessment> assessments = readList("assessments.json", new TypeReference<>() {});
            synchronized (store.getAssessments()) {
                store.getAssessments().clear();
                store.getAssessments().addAll(assessments);
            }
            store.clearDirty();
        } catch (IOException ex) {
            throw new DataPersistenceException("Failed to load tracker data from JSON files.", ex);
        }
    }

    private <T> void writeList(String filename, List<T> data) throws IOException {
        Path target = dataDirectory.resolve(filename);
        objectMapper.writeValue(target.toFile(), data);
    }

    private void writePersonList(String filename, List<Person> data) throws IOException {
        Path target = dataDirectory.resolve(filename);
        objectMapper.writerFor(new TypeReference<List<Person>>() {}).writeValue(target.toFile(), data);
    }

    private <T> List<T> readList(String filename, TypeReference<List<T>> typeRef) throws IOException {
        Path target = dataDirectory.resolve(filename);
        if (!Files.exists(target)) {
            return new ArrayList<>();
        }
        return objectMapper.readValue(target.toFile(), typeRef);
    }
}
