package com.tracker.util;

import com.tracker.model.AcademicClass;
import com.tracker.model.AcademicCoordinator;
import com.tracker.model.Administrator;
import com.tracker.model.Assessment;
import com.tracker.model.Assignment;
import com.tracker.model.AttendanceRecord;
import com.tracker.model.AttendanceStatus;
import com.tracker.model.ClassAdvisor;
import com.tracker.model.Dean;
import com.tracker.model.Department;
import com.tracker.model.ExamCellCoordinator;
import com.tracker.model.Faculty;
import com.tracker.model.HeadOfDepartment;
import com.tracker.model.InternalTest;
import com.tracker.model.LabInstructor;
import com.tracker.model.LabRecord;
import com.tracker.model.Staff;
import com.tracker.model.Student;
import com.tracker.model.SubjectFaculty;
import com.tracker.repository.DataStore;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

// OOP: Seed data generator preloading 7 departments, 28 classes, 224 South Indian students, 3 Deans + full staff teams per department
public final class SeedDataGenerator {

    private static final String[] STUDENT_FIRST_NAMES = {
            "Arun", "Kavya", "Vignesh", "Divya", "Harish", "Priyadharshini", "Praveen", "Swetha",
            "Naveen", "Harini", "Dinesh", "Meenakshi", "Gokul", "Keerthana", "Ashwin", "Janani",
            "Rohith", "Nandhini", "Sai", "Lavanya", "Pranav", "Anjali", "Anoop", "Athira",
            "Arjun", "Gayathri", "Kiran", "Shruthi", "Karthik", "Aishwarya", "Surya", "Bhavya",
            "Bala", "Deepthi", "Madhav", "Indhu", "Nithin", "Pavithra", "Srinivas", "Ramya",
            "Vikram", "Revathi", "Charan", "Sandhya", "Raghav", "Sneha", "Deepak", "Vaishnavi"
    };

    private static final String[] STUDENT_SURNAMES = {
            "Subramanian", "Murugan", "Krishnan", "Venkatesh", "Reddy", "Rao", "Nair", "Menon",
            "Gowda", "Sundaram", "Iyer", "Murali", "Ramesh", "Naidu", "Pillai", "Balaji"
    };

    private static final String[][] STAFF_PROFILES = {
            // { Display Name, Email Local Part } - 91 distinct South Indian names with academic titles
            {"Dr. N. Gopinath", "gopinath.natarajan"},
            {"Prof. M. Thenmozhi", "thenmozhi.murugan"},
            {"Prof. K. Arumugam", "arumugam.krishnan"},
            {"Mr. T. Balasubramanian", "balasubramanian.thirumalai"},
            {"Ms. P. Kalaiselvi", "kalaiselvi.pandian"},
            {"Ms. A. Revathi", "revathi.aravind"},
            {"Dr. K. Senthilvel", "senthilvel.kannan"},
            {"Prof. R. Vasudha", "vasudha.ramachandran"},
            {"Dr. P. Muthukumar", "muthukumar.palani"},
            {"Prof. S. Deepalakshmi", "deepalakshmi.srinivasan"},
            {"Prof. B. Saravanan", "saravanan.baskaran"},
            {"Ms. V. Kalyani", "kalyani.venkataraman"},
            {"Dr. G. Viswanathan", "viswanathan.gopalan"},

            {"Dr. R. Thirunavukkarasu", "thirunavukkarasu.raj"},
            {"Prof. S. Karpagam", "karpagam.subramanian"},
            {"Mr. V. Loganathan", "loganathan.velu"},
            {"Ms. K. Malarvizhi", "malarvizhi.karthik"},
            {"Prof. N. Rajendran", "rajendran.narayanan"},
            {"Ms. D. Shanmugapriya", "shanmugapriya.durai"},
            {"Prof. C. Elangovan", "elangovan.chandran"},
            {"Dr. L. Padmavathi", "padmavathi.lakshmanan"},
            {"Prof. M. Sivakumar", "sivakumar.manickam"},
            {"Ms. R. Bhuvaneswari", "bhuvaneswari.ramasamy"},
            {"Prof. A. Chandrasekar", "chandrasekar.anandan"},
            {"Ms. S. Hemalatha", "hemalatha.sundar"},
            {"Dr. T. Venkateswaran", "venkateswaran.thiyagu"},

            {"Dr. V. Subbulakshmi", "subbulakshmi.venkatesh"},
            {"Prof. K. Narasimhan", "narasimhan.krishnamurthy"},
            {"Dr. B. Jayaprakash", "jayaprakash.balu"},
            {"Ms. M. Nandhakumari", "nandhakumari.mohan"},
            {"Prof. R. Parthasarathy", "parthasarathy.rangan"},
            {"Ms. G. Mythili", "mythili.govindan"},
            {"Dr. S. Prabhakaran", "prabhakaran.selvam"},
            {"Prof. K. Umamaheswari", "umamaheswari.kandasamy"},
            {"Dr. A. Rajagopal", "rajagopal.ayyappan"},
            {"Prof. N. Soundarya", "soundarya.nagarajan"},
            {"Mr. P. Karthikeyan", "karthikeyan.perumal"},
            {"Ms. V. Mahalakshmi", "mahalakshmi.vasudevan"},
            {"Dr. D. Sudhakar", "sudhakar.devaraj"},

            {"Dr. M. Ramalingam", "ramalingam.muthu"},
            {"Prof. S. Vidyashankar", "vidyashankar.sethu"},
            {"Dr. K. Vijayakumar", "vijayakumar.kailasam"},
            {"Mr. R. Sathishkumar", "sathishkumar.rajesh"},
            {"Ms. T. Anuradha", "anuradha.thangavel"},
            {"Prof. P. Jagadeesan", "jagadeesan.ponnusamy"},
            {"Ms. N. Gomathi", "gomathi.natesan"},
            {"Dr. V. Ravichandran", "ravichandran.veerappan"},
            {"Prof. L. Madhavan", "madhavan.lingam"},
            {"Ms. K. Geethanjali", "geethanjali.kumaran"},
            {"Dr. S. Balamurugan", "balamurugan.shanmugam"},
            {"Prof. R. Suganthi", "suganthi.raghavan"},
            {"Mr. G. Prakash", "prakash.ganesan"},

            {"Dr. P. Venkatesan", "venkatesan.periyasamy"},
            {"Prof. R. Nirmala", "nirmala.raju"},
            {"Dr. K. Palanisamy", "palanisamy.kuppusamy"},
            {"Ms. S. TamilSelvi", "tamilselvi.sankaran"},
            {"Prof. V. Mahendran", "mahendran.vasanth"},
            {"Ms. D. Chithra", "chithra.devan"},
            {"Dr. N. Radhakrishnan", "radhakrishnan.neelakantan"},
            {"Prof. M. Yogeswari", "yogeswari.murugesan"},
            {"Dr. T. Gunasekaran", "gunasekaran.thiru"},
            {"Prof. A. Kaveri", "kaveri.arjun"},
            {"Mr. S. Vigneshwaran", "vigneshwaran.samy"},
            {"Ms. B. Abirami", "abirami.balasundaram"},
            {"Dr. R. Suryanarayanan", "suryanarayanan.raman"},

            {"Dr. K. Rajasekaran", "rajasekaran.karuppan"},
            {"Prof. V. Selvaraj", "selvaraj.veeramani"},
            {"Dr. M. Shanmugam", "shanmugam.marimuthu"},
            {"Mr. N. Thangaraj", "thangaraj.navaneethan"},
            {"Ms. R. Poongodi", "poongodi.ramachandran"},
            {"Prof. S. Murugavel", "murugavel.srinivas"},
            {"Ms. P. Kokila", "kokila.prabhakar"},
            {"Dr. A. Baskaran", "baskaran.alagappan"},
            {"Prof. T. Vanitha", "vanitha.thirumal"},
            {"Dr. G. Mohanraj", "mohanraj.gurusamy"},
            {"Ms. K. Sridevi", "sridevi.krishnan"},
            {"Prof. B. Natarajan", "natarajan.bhoopathy"},
            {"Mr. V. Kumaresan", "kumaresan.vadivel"},

            {"Dr. S. Aravindhan", "aravindhan.subramani"},
            {"Prof. P. Annapoorani", "annapoorani.pandurangan"},
            {"Dr. R. Sivagnanam", "sivagnanam.ramalingam"},
            {"Mr. K. Manikandan", "manikandan.kesavan"},
            {"Ms. V. Pavai", "pavai.venkatesh"},
            {"Prof. M. Thirupathi", "thirupathi.muthukrishnan"},
            {"Ms. D. Brindha", "brindha.dhanasekar"},
            {"Dr. N. Kaliyaperumal", "kaliyaperumal.nallusamy"},
            {"Prof. S. Renuka", "renuka.sivakumar"},
            {"Dr. T. Ezhilarasan", "ezhilarasan.thambiran"},
            {"Ms. A. Vasanthi", "vasanthi.anbazhagan"},
            {"Prof. G. Devendran", "devendran.govindaraj"},
            {"Mr. R. Ilayaraja", "ilayaraja.rajamani"}
    };

    private SeedDataGenerator() {
    }

    public static void populateSeedData(DataStore store) {
        // 1. Administrator (1)
        Administrator admin = new Administrator(
                "ADM-001", "Dr. S. Natarajan", "admin@college.edu", "admin123",
                "Principal & Chief Administrator", "Administrative Block Room 101"
        );
        store.getAdministrators().put(admin.getId(), admin);

        // 2. Seven Departments (CSE, IT, AI&DS, ECE, EEE, MECH, CIVIL)
        List<Department> departments = Arrays.asList(
                new Department("DEPT-CSE", "CSE", "Computer Science and Engineering", "Dr. N. Gopinath"),
                new Department("DEPT-IT", "IT", "Information Technology", "Dr. R. Thirunavukkarasu"),
                new Department("DEPT-AIDS", "AI&DS", "Artificial Intelligence and Data Science", "Dr. V. Subbulakshmi"),
                new Department("DEPT-ECE", "ECE", "Electronics and Communication Engineering", "Dr. M. Ramalingam"),
                new Department("DEPT-EEE", "EEE", "Electrical and Electronics Engineering", "Dr. P. Venkatesan"),
                new Department("DEPT-MECH", "MECH", "Mechanical Engineering", "Dr. K. Rajasekaran"),
                new Department("DEPT-CIVIL", "CIVIL", "Civil Engineering", "Dr. S. Aravindhan")
        );
        for (Department dept : departments) {
            store.getDepartments().put(dept.getId(), dept);
        }

        // 3. Deans (3 Deans overseeing 2-3 related departments each)
        Dean deanComputing = new Dean(
                "STF-DEAN-01", "Dr. R. Meenakshi Sundaram", "meenakshi.sundaram@college.edu", "staff123",
                "DEPT-CSE", List.of("DEPT-CSE", "DEPT-IT", "DEPT-AIDS"),
                "Dean - School of Computing"
        );
        Dean deanElectrical = new Dean(
                "STF-DEAN-02", "Dr. S. Vijayalakshmi", "vijayalakshmi.subramanian@college.edu", "staff123",
                "DEPT-ECE", List.of("DEPT-ECE", "DEPT-EEE"),
                "Dean - School of Electrical Sciences"
        );
        Dean deanCore = new Dean(
                "STF-DEAN-03", "Dr. V. Raghavendran", "raghavendran.venkatesh@college.edu", "staff123",
                "DEPT-MECH", List.of("DEPT-MECH", "DEPT-CIVIL"),
                "Dean - School of Mechanical & Civil Engineering"
        );
        for (Dean dean : List.of(deanComputing, deanElectrical, deanCore)) {
            store.getStaffMembers().put(dean.getId(), dean);
        }

        // 4. Subjects per department (II Year Sem 4 and III Year Sem 6 - 5 coded subjects each)
        Map<String, List<String>> year2Subjects = new LinkedHashMap<>();
        Map<String, List<String>> year3Subjects = new LinkedHashMap<>();

        year2Subjects.put("DEPT-CSE", List.of("CS3401 Data Structures", "CS3402 Object-Oriented Programming", "CS3403 Database Management Systems", "CS3404 Operating Systems", "CS3405 Computer Networks"));
        year3Subjects.put("DEPT-CSE", List.of("CS3601 Compiler Design", "CS3602 Distributed Systems", "CS3603 Software Engineering", "CS3604 Machine Learning", "CS3605 Cloud Computing"));

        year2Subjects.put("DEPT-IT", List.of("IT3401 Data Structures & Algorithms", "IT3402 Object-Oriented Software Design", "IT3403 Relational Databases", "IT3404 Web Engineering", "IT3405 Computer Organization"));
        year3Subjects.put("DEPT-IT", List.of("IT3601 Network Security", "IT3602 Full Stack Architecture", "IT3603 Cloud Infrastructure", "IT3604 Mobile Computing", "IT3605 Big Data Analytics"));

        year2Subjects.put("DEPT-AIDS", List.of("AD3401 Foundations of Data Science", "AD3402 Probability & Linear Algebra", "AD3403 Artificial Intelligence", "AD3404 Python for Analytics", "AD3405 Database Systems"));
        year3Subjects.put("DEPT-AIDS", List.of("AD3601 Deep Learning", "AD3602 Natural Language Processing", "AD3603 Computer Vision", "AD3604 Reinforcement Learning", "AD3605 MLOps Engineering"));

        year2Subjects.put("DEPT-ECE", List.of("EC3401 Digital Electronics", "EC3402 Signals & Systems", "EC3403 Analog Circuits", "EC3404 Microprocessors", "EC3405 Electromagnetic Fields"));
        year3Subjects.put("DEPT-ECE", List.of("EC3601 VLSI Design", "EC3602 Communication Theory", "EC3603 Embedded Systems", "EC3604 Digital Signal Processing", "EC3605 Antenna Engineering"));

        year2Subjects.put("DEPT-EEE", List.of("EE3401 Electric Circuit Analysis", "EE3402 Electrical Machines I", "EE3403 Control Systems", "EE3404 Power Electronics", "EE3405 Measurements & Instrumentation"));
        year3Subjects.put("DEPT-EEE", List.of("EE3601 Power Systems Analysis", "EE3602 Electrical Machines II", "EE3603 High Voltage Engineering", "EE3604 Microcontrollers", "EE3605 Renewable Energy Systems"));

        year2Subjects.put("DEPT-MECH", List.of("ME3401 Engineering Thermodynamics", "ME3402 Fluid Mechanics", "ME3403 Strength of Materials", "ME3404 Kinematics of Machinery", "ME3405 Manufacturing Processes"));
        year3Subjects.put("DEPT-MECH", List.of("ME3601 Heat & Mass Transfer", "ME3602 Machine Design", "ME3603 Dynamics of Machinery", "ME3604 CAD/CAM Automation", "ME3605 Finite Element Analysis"));

        year2Subjects.put("DEPT-CIVIL", List.of("CE3401 Structural Analysis I", "CE3402 Surveying & Geomatics", "CE3403 Hydraulics Engineering", "CE3404 Concrete Technology", "CE3405 Geotechnical Engineering"));
        year3Subjects.put("DEPT-CIVIL", List.of("CE3601 Design of RCC Structures", "CE3602 Environmental Engineering", "CE3603 Transportation Engineering", "CE3604 Foundation Engineering", "CE3605 Construction Management"));

        // 5. Classes (4 per department = 28 classes) + Full Staff Team per Department (13 + 1 Dean = 14 staff per dept)
        List<AcademicClass> allClasses = new ArrayList<>();
        int staffCursor = 0;

        for (Department dept : departments) {
            String deptId = dept.getId();
            String code = dept.getCode();
            String cleanCode = code.replace("&", "");
            List<String> y2Subs = year2Subjects.get(deptId);
            List<String> y3Subs = year3Subjects.get(deptId);

            AcademicClass c2A = new AcademicClass("CLS-" + cleanCode + "-2A", code + " II Year - Section A", deptId, 4, "A", y2Subs);
            AcademicClass c2B = new AcademicClass("CLS-" + cleanCode + "-2B", code + " II Year - Section B", deptId, 4, "B", y2Subs);
            AcademicClass c3A = new AcademicClass("CLS-" + cleanCode + "-3A", code + " III Year - Section A", deptId, 6, "A", y3Subs);
            AcademicClass c3B = new AcademicClass("CLS-" + cleanCode + "-3B", code + " III Year - Section B", deptId, 6, "B", y3Subs);

            List<AcademicClass> deptClasses = List.of(c2A, c2B, c3A, c3B);
            for (AcademicClass ac : deptClasses) {
                store.getClasses().put(ac.getId(), ac);
                allClasses.add(ac);
            }
            List<String> deptClassIds = List.of(c2A.getId(), c2B.getId(), c3A.getId(), c3B.getId());

            // 5a. HOD
            String[] hodInfo = STAFF_PROFILES[staffCursor++];
            HeadOfDepartment hod = new HeadOfDepartment(
                    "STF-" + cleanCode + "-HOD", hodInfo[0], hodInfo[1] + "@college.edu", "staff123",
                    deptId, "Professor & HOD", List.of(y2Subs.get(0), y3Subs.get(0))
            );
            store.getStaffMembers().put(hod.getId(), hod);

            // 5b. Academic Coordinator
            String[] acInfo = STAFF_PROFILES[staffCursor++];
            AcademicCoordinator coordinator = new AcademicCoordinator(
                    "STF-" + cleanCode + "-AC", acInfo[0], acInfo[1] + "@college.edu", "staff123",
                    deptId, "Associate Professor & Academic Coordinator", deptClassIds
            );
            store.getStaffMembers().put(coordinator.getId(), coordinator);

            // 5c. Exam Cell Coordinator
            String[] ecInfo = STAFF_PROFILES[staffCursor++];
            ExamCellCoordinator examCoordinator = new ExamCellCoordinator(
                    "STF-" + cleanCode + "-EC", ecInfo[0], ecInfo[1] + "@college.edu", "staff123",
                    deptId, "Assistant Professor & Exam Cell Coordinator", deptClassIds
            );
            store.getStaffMembers().put(examCoordinator.getId(), examCoordinator);

            // 5d. Lab Instructor
            String[] labInfo = STAFF_PROFILES[staffCursor++];
            LabInstructor labInstructor = new LabInstructor(
                    "STF-" + cleanCode + "-LAB", labInfo[0], labInfo[1] + "@college.edu", "faculty123",
                    deptId, "Senior Lab Instructor", deptClassIds, List.of(y2Subs.get(0), y2Subs.get(2), y3Subs.get(1))
            );
            store.getStaffMembers().put(labInstructor.getId(), labInstructor);

            // 5e. Class Advisors (1 per class = 4)
            for (int cIdx = 0; cIdx < deptClasses.size(); cIdx++) {
                AcademicClass ac = deptClasses.get(cIdx);
                String[] advInfo = STAFF_PROFILES[staffCursor++];
                ClassAdvisor advisor = new ClassAdvisor(
                        "STF-" + cleanCode + "-ADV" + (cIdx + 1), advInfo[0], advInfo[1] + "@college.edu", "staff123",
                        deptId, "Assistant Professor & Class Advisor",
                        List.of(ac.getId()), List.of(ac.getSubjects().get(0))
                );
                store.getStaffMembers().put(advisor.getId(), advisor);
            }

            // 5f. Subject Faculty (5 per department, each assigned specific subjects & classes)
            for (int fIdx = 0; fIdx < 5; fIdx++) {
                String[] facInfo = STAFF_PROFILES[staffCursor++];
                List<String> handledSubjects = List.of(y2Subs.get(fIdx), y3Subs.get(fIdx));
                List<String> handledClasses = (fIdx % 2 == 0)
                        ? List.of(c2A.getId(), c3A.getId())
                        : List.of(c2B.getId(), c3B.getId());
                if (fIdx == 0) {
                    handledClasses = deptClassIds;
                }

                SubjectFaculty subjectFaculty = new SubjectFaculty(
                        "STF-" + cleanCode + "-FAC" + (fIdx + 1), facInfo[0], facInfo[1] + "@college.edu", "faculty123",
                        deptId, "Assistant Professor", handledClasses, handledSubjects
                );
                store.getStaffMembers().put(subjectFaculty.getId(), subjectFaculty);

                // Keep backward-compatible Faculty map populated
                Faculty legacyCompat = new Faculty(
                        subjectFaculty.getId(), subjectFaculty.getName(), subjectFaculty.getEmail(), "faculty123",
                        deptId, subjectFaculty.getDesignation(), handledClasses, handledSubjects
                );
                store.getFaculty().put(legacyCompat.getId(), legacyCompat);
            }
        }

        // 6. Students (8 per class x 28 classes = 224 students with unique South Indian names)
        List<Student> createdStudents = new ArrayList<>();
        int studentIndex = 0;

        for (AcademicClass academicClass : allClasses) {
            String deptCode = store.getDepartments().get(academicClass.getDepartmentId()).getCode().replace("&", "");
            String yearTag = academicClass.getSemester() <= 4 ? "24" : "23";

            for (int slot = 1; slot <= 8; slot++) {
                String id = String.format("STU-%03d", 101 + studentIndex);
                String firstName = STUDENT_FIRST_NAMES[studentIndex % STUDENT_FIRST_NAMES.length];
                int surnameIdx = ((studentIndex / STUDENT_FIRST_NAMES.length) + (studentIndex % STUDENT_SURNAMES.length)) % STUDENT_SURNAMES.length;
                String lastName = STUDENT_SURNAMES[surnameIdx];
                String fullName = firstName + " " + lastName;
                String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + "@college.edu";
                String rollNumber = String.format("%s%s%s%02d", yearTag, deptCode, academicClass.getSection(), slot);

                Student student = new Student(
                        id, fullName, email, "student123",
                        rollNumber, academicClass.getDepartmentId(), academicClass.getId(), academicClass.getSemester()
                );
                store.getStudents().put(student.getId(), student);
                createdStudents.add(student);
                studentIndex++;
            }
        }

        // 7. Seeded Attendance (20 working days) & 3 Internal Assessments per Subject
        List<LocalDate> workingDays = new ArrayList<>();
        LocalDate cursor = LocalDate.now().minusDays(28);
        while (workingDays.size() < 20) {
            DayOfWeek day = cursor.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                workingDays.add(cursor);
            }
            cursor = cursor.plusDays(1);
        }

        Random random = new Random(42L);
        long attCounter = 1;
        long assCounter = 1;

        for (int sIdx = 0; sIdx < createdStudents.size(); sIdx++) {
            Student student = createdStudents.get(sIdx);
            AcademicClass academicClass = store.getClasses().get(student.getClassId());
            List<String> subjects = academicClass.getSubjects();
            String cleanCode = store.getDepartments().get(student.getDepartmentId()).getCode().replace("&", "");
            String markerId = "STF-" + cleanCode + "-FAC1";

            boolean shortageProfile = (sIdx % 5 == 3);
            int presentCount = 0;
            int decidedCount = 0;

            for (int dIdx = 0; dIdx < workingDays.size(); dIdx++) {
                LocalDate date = workingDays.get(dIdx);
                String subject = subjects.get(dIdx % subjects.size());

                AttendanceStatus status;
                double roll = random.nextDouble();
                if (dIdx == workingDays.size() - 1 && sIdx % 7 == 2) {
                    status = AttendanceStatus.PENDING;
                } else if (shortageProfile) {
                    status = (roll < 0.64) ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
                } else {
                    status = (roll < 0.89) ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
                }

                if (status == AttendanceStatus.PRESENT) {
                    presentCount++;
                    decidedCount++;
                } else if (status == AttendanceStatus.ABSENT) {
                    decidedCount++;
                }

                store.getAttendanceRecords().add(new AttendanceRecord(
                        String.format("ATT-%05d", attCounter++),
                        student.getId(),
                        student.getClassId(),
                        subject,
                        date,
                        status,
                        markerId,
                        LocalDateTime.now().minusDays(20 - dIdx),
                        status == AttendanceStatus.PENDING ? "Medical leave proof submitted" : ""
                ));
            }

            double attendancePct = decidedCount == 0 ? 100.0 : (presentCount * 100.0) / decidedCount;
            student.setAttendancePercentage(attendancePct);

            double totalWeightedSum = 0.0;
            double basePerformance = (sIdx % 11 == 9) ? 41.0 : 58.0 + (sIdx % 6) * 6.5;

            for (int subIdx = 0; subIdx < subjects.size(); subIdx++) {
                String subject = subjects.get(subIdx);
                double factor = Math.min(0.98, Math.max(0.32, (basePerformance + random.nextInt(15) - 5) / 100.0));

                double testMarks = Math.round(50.0 * factor * 2.0) / 2.0;
                double assignMarks = Math.round(25.0 * Math.min(1.0, factor + 0.05) * 2.0) / 2.0;
                double labMarks = Math.round(25.0 * Math.min(1.0, factor + 0.08) * 2.0) / 2.0;

                InternalTest test = new InternalTest(
                        String.format("ASM-%05d", assCounter++),
                        student.getId(), student.getClassId(), subject,
                        "Internal Assessment Test", 50.0, testMarks,
                        LocalDate.now().minusDays(10 - (subIdx % 5)), 1, 0.50
                );
                Assignment assignment = new Assignment(
                        String.format("ASM-%05d", assCounter++),
                        student.getId(), student.getClassId(), subject,
                        "Technical Assignment", 25.0, assignMarks,
                        LocalDate.now().minusDays(7 - (subIdx % 4)), sIdx % 8 != 0, 0.25
                );
                LabRecord labRecord = new LabRecord(
                        String.format("ASM-%05d", assCounter++),
                        student.getId(), student.getClassId(), subject,
                        "Lab Record & Viva", 25.0, labMarks,
                        LocalDate.now().minusDays(4 - (subIdx % 3)), 8 + (sIdx % 3), 0.25
                );

                // Pre-verify first 2 subjects for realistic Exam Cell Coordinator queue
                if (subIdx < 2) {
                    String verifier = "STF-" + cleanCode + "-EC";
                    test.setVerifiedByExamCell(true);
                    test.setVerifiedBy(verifier);
                    assignment.setVerifiedByExamCell(true);
                    assignment.setVerifiedBy(verifier);
                    labRecord.setVerifiedByExamCell(true);
                    labRecord.setVerifiedBy(verifier);
                }

                store.getAssessments().addAll(Arrays.asList(test, assignment, labRecord));
                totalWeightedSum += test.calculateWeightedScore()
                        + assignment.calculateWeightedScore()
                        + labRecord.calculateWeightedScore();
            }

            student.setAcademicPercentage(totalWeightedSum / subjects.size());
        }

        store.markDirty();
    }
}
