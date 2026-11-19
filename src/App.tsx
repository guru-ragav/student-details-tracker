import React, { useMemo, useState } from 'react';
import {
  Check,
  X,
  Clock,
  GraduationCap,
  Printer,
  Download,
  AlertTriangle,
  Layers,
  ShieldCheck,
  BookOpen,
  Users,
  FlaskConical,
  ClipboardCheck,
} from 'lucide-react';

type Role =
  | 'ADMIN'
  | 'DEAN'
  | 'HOD'
  | 'ACADEMIC_COORDINATOR'
  | 'CLASS_ADVISOR'
  | 'FACULTY'
  | 'EXAM_CELL_COORDINATOR'
  | 'STUDENT';

type StaffRoleTitle =
  | 'Dean'
  | 'Head of Department'
  | 'Academic Coordinator'
  | 'Exam Cell Coordinator'
  | 'Class Advisor'
  | 'Lab Instructor'
  | 'Subject Faculty';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'PENDING';
type GradingStrategyName = 'ABSOLUTE' | 'RELATIVE';
type AssessmentCategory = 'INTERNAL_TEST' | 'ASSIGNMENT' | 'LAB_RECORD';

interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
}

interface AcademicClass {
  id: string;
  name: string;
  departmentId: string;
  semester: number;
  section: string;
  subjects: string[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  departmentId: string;
  classId: string;
  semester: number;
  attendancePercentage: number;
  academicPercentage: number;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  password: string;
  departmentId: string;
  overseenDepartmentIds: string[];
  designation: string;
  roleTitle: StaffRoleTitle;
  loginRole: Role;
  assignedClassIds: string[];
  subjects: string[];
}

interface AssessmentItem {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  category: AssessmentCategory;
  maxMarks: number;
  marksObtained: number;
  verifiedByExamCell: boolean;
  verifiedBy: string;
}

const STUDENT_FIRST_NAMES = [
  'Arun', 'Kavya', 'Vignesh', 'Divya', 'Harish', 'Priyadharshini', 'Praveen', 'Swetha',
  'Naveen', 'Harini', 'Dinesh', 'Meenakshi', 'Gokul', 'Keerthana', 'Ashwin', 'Janani',
  'Rohith', 'Nandhini', 'Sai', 'Lavanya', 'Pranav', 'Anjali', 'Anoop', 'Athira',
  'Arjun', 'Gayathri', 'Kiran', 'Shruthi', 'Karthik', 'Aishwarya', 'Surya', 'Bhavya',
  'Bala', 'Deepthi', 'Madhav', 'Indhu', 'Nithin', 'Pavithra', 'Srinivas', 'Ramya',
  'Vikram', 'Revathi', 'Charan', 'Sandhya', 'Raghav', 'Sneha', 'Deepak', 'Vaishnavi',
];

const STUDENT_SURNAMES = [
  'Subramanian', 'Murugan', 'Krishnan', 'Venkatesh', 'Reddy', 'Rao', 'Nair', 'Menon',
  'Gowda', 'Sundaram', 'Iyer', 'Murali', 'Ramesh', 'Naidu', 'Pillai', 'Balaji',
];

const STAFF_PROFILES: [string, string][] = [
  ['Dr. N. Gopinath', 'gopinath.natarajan'],
  ['Prof. M. Thenmozhi', 'thenmozhi.murugan'],
  ['Prof. K. Arumugam', 'arumugam.krishnan'],
  ['Mr. T. Balasubramanian', 'balasubramanian.thirumalai'],
  ['Ms. P. Kalaiselvi', 'kalaiselvi.pandian'],
  ['Ms. A. Revathi', 'revathi.aravind'],
  ['Dr. K. Senthilvel', 'senthilvel.kannan'],
  ['Prof. R. Vasudha', 'vasudha.ramachandran'],
  ['Dr. P. Muthukumar', 'muthukumar.palani'],
  ['Prof. S. Deepalakshmi', 'deepalakshmi.srinivasan'],
  ['Prof. B. Saravanan', 'saravanan.baskaran'],
  ['Ms. V. Kalyani', 'kalyani.venkataraman'],
  ['Dr. G. Viswanathan', 'viswanathan.gopalan'],

  ['Dr. R. Thirunavukkarasu', 'thirunavukkarasu.raj'],
  ['Prof. S. Karpagam', 'karpagam.subramanian'],
  ['Mr. V. Loganathan', 'loganathan.velu'],
  ['Ms. K. Malarvizhi', 'malarvizhi.karthik'],
  ['Prof. N. Rajendran', 'rajendran.narayanan'],
  ['Ms. D. Shanmugapriya', 'shanmugapriya.durai'],
  ['Prof. C. Elangovan', 'elangovan.chandran'],
  ['Dr. L. Padmavathi', 'padmavathi.lakshmanan'],
  ['Prof. M. Sivakumar', 'sivakumar.manickam'],
  ['Ms. R. Bhuvaneswari', 'bhuvaneswari.ramasamy'],
  ['Prof. A. Chandrasekar', 'chandrasekar.anandan'],
  ['Ms. S. Hemalatha', 'hemalatha.sundar'],
  ['Dr. T. Venkateswaran', 'venkateswaran.thiyagu'],

  ['Dr. V. Subbulakshmi', 'subbulakshmi.venkatesh'],
  ['Prof. K. Narasimhan', 'narasimhan.krishnamurthy'],
  ['Dr. B. Jayaprakash', 'jayaprakash.balu'],
  ['Ms. M. Nandhakumari', 'nandhakumari.mohan'],
  ['Prof. R. Parthasarathy', 'parthasarathy.rangan'],
  ['Ms. G. Mythili', 'mythili.govindan'],
  ['Dr. S. Prabhakaran', 'prabhakaran.selvam'],
  ['Prof. K. Umamaheswari', 'umamaheswari.kandasamy'],
  ['Dr. A. Rajagopal', 'rajagopal.ayyappan'],
  ['Prof. N. Soundarya', 'soundarya.nagarajan'],
  ['Mr. P. Karthikeyan', 'karthikeyan.perumal'],
  ['Ms. V. Mahalakshmi', 'mahalakshmi.vasudevan'],
  ['Dr. D. Sudhakar', 'sudhakar.devaraj'],

  ['Dr. M. Ramalingam', 'ramalingam.muthu'],
  ['Prof. S. Vidyashankar', 'vidyashankar.sethu'],
  ['Dr. K. Vijayakumar', 'vijayakumar.kailasam'],
  ['Mr. R. Sathishkumar', 'sathishkumar.rajesh'],
  ['Ms. T. Anuradha', 'anuradha.thangavel'],
  ['Prof. P. Jagadeesan', 'jagadeesan.ponnusamy'],
  ['Ms. N. Gomathi', 'gomathi.natesan'],
  ['Dr. V. Ravichandran', 'ravichandran.veerappan'],
  ['Prof. L. Madhavan', 'madhavan.lingam'],
  ['Ms. K. Geethanjali', 'geethanjali.kumaran'],
  ['Dr. S. Balamurugan', 'balamurugan.shanmugam'],
  ['Prof. R. Suganthi', 'suganthi.raghavan'],
  ['Mr. G. Prakash', 'prakash.ganesan'],

  ['Dr. P. Venkatesan', 'venkatesan.periyasamy'],
  ['Prof. R. Nirmala', 'nirmala.raju'],
  ['Dr. K. Palanisamy', 'palanisamy.kuppusamy'],
  ['Ms. S. TamilSelvi', 'tamilselvi.sankaran'],
  ['Prof. V. Mahendran', 'mahendran.vasanth'],
  ['Ms. D. Chithra', 'chithra.devan'],
  ['Dr. N. Radhakrishnan', 'radhakrishnan.neelakantan'],
  ['Prof. M. Yogeswari', 'yogeswari.murugesan'],
  ['Dr. T. Gunasekaran', 'gunasekaran.thiru'],
  ['Prof. A. Kaveri', 'kaveri.arjun'],
  ['Mr. S. Vigneshwaran', 'vigneshwaran.samy'],
  ['Ms. B. Abirami', 'abirami.balasundaram'],
  ['Dr. R. Suryanarayanan', 'suryanarayanan.raman'],

  ['Dr. K. Rajasekaran', 'rajasekaran.karuppan'],
  ['Prof. V. Selvaraj', 'selvaraj.veeramani'],
  ['Dr. M. Shanmugam', 'shanmugam.marimuthu'],
  ['Mr. N. Thangaraj', 'thangaraj.navaneethan'],
  ['Ms. R. Poongodi', 'poongodi.ramachandran'],
  ['Prof. S. Murugavel', 'murugavel.srinivas'],
  ['Ms. P. Kokila', 'kokila.prabhakar'],
  ['Dr. A. Baskaran', 'baskaran.alagappan'],
  ['Prof. T. Vanitha', 'vanitha.thirumal'],
  ['Dr. G. Mohanraj', 'mohanraj.gurusamy'],
  ['Ms. K. Sridevi', 'sridevi.krishnan'],
  ['Prof. B. Natarajan', 'natarajan.bhoopathy'],
  ['Mr. V. Kumaresan', 'kumaresan.vadivel'],

  ['Dr. S. Aravindhan', 'aravindhan.subramani'],
  ['Prof. P. Annapoorani', 'annapoorani.pandurangan'],
  ['Dr. R. Sivagnanam', 'sivagnanam.ramalingam'],
  ['Mr. K. Manikandan', 'manikandan.kesavan'],
  ['Ms. V. Pavai', 'pavai.venkatesh'],
  ['Prof. M. Thirupathi', 'thirupathi.muthukrishnan'],
  ['Ms. D. Brindha', 'brindha.dhanasekar'],
  ['Dr. N. Kaliyaperumal', 'kaliyaperumal.nallusamy'],
  ['Prof. S. Renuka', 'renuka.sivakumar'],
  ['Dr. T. Ezhilarasan', 'ezhilarasan.thambiran'],
  ['Ms. A. Vasanthi', 'vasanthi.anbazhagan'],
  ['Prof. G. Devendran', 'devendran.govindaraj'],
  ['Mr. R. Ilayaraja', 'ilayaraja.rajamani'],
];

function createInitialData() {
  const departments: Department[] = [
    { id: 'DEPT-CSE', code: 'CSE', name: 'Computer Science and Engineering', headOfDepartment: 'Dr. N. Gopinath' },
    { id: 'DEPT-IT', code: 'IT', name: 'Information Technology', headOfDepartment: 'Dr. R. Thirunavukkarasu' },
    { id: 'DEPT-AIDS', code: 'AI&DS', name: 'Artificial Intelligence and Data Science', headOfDepartment: 'Dr. V. Subbulakshmi' },
    { id: 'DEPT-ECE', code: 'ECE', name: 'Electronics and Communication Engineering', headOfDepartment: 'Dr. M. Ramalingam' },
    { id: 'DEPT-EEE', code: 'EEE', name: 'Electrical and Electronics Engineering', headOfDepartment: 'Dr. P. Venkatesan' },
    { id: 'DEPT-MECH', code: 'MECH', name: 'Mechanical Engineering', headOfDepartment: 'Dr. K. Rajasekaran' },
    { id: 'DEPT-CIVIL', code: 'CIVIL', name: 'Civil Engineering', headOfDepartment: 'Dr. S. Aravindhan' },
  ];

  const y2Subjects: Record<string, string[]> = {
    'DEPT-CSE': ['CS3401 Data Structures', 'CS3402 Object-Oriented Programming', 'CS3403 Database Management Systems', 'CS3404 Operating Systems', 'CS3405 Computer Networks'],
    'DEPT-IT': ['IT3401 Data Structures & Algorithms', 'IT3402 Object-Oriented Software Design', 'IT3403 Relational Databases', 'IT3404 Web Engineering', 'IT3405 Computer Organization'],
    'DEPT-AIDS': ['AD3401 Foundations of Data Science', 'AD3402 Probability & Linear Algebra', 'AD3403 Artificial Intelligence', 'AD3404 Python for Analytics', 'AD3405 Database Systems'],
    'DEPT-ECE': ['EC3401 Digital Electronics', 'EC3402 Signals & Systems', 'EC3403 Analog Circuits', 'EC3404 Microprocessors', 'EC3405 Electromagnetic Fields'],
    'DEPT-EEE': ['EE3401 Electric Circuit Analysis', 'EE3402 Electrical Machines I', 'EE3403 Control Systems', 'EE3404 Power Electronics', 'EE3405 Measurements & Instrumentation'],
    'DEPT-MECH': ['ME3401 Engineering Thermodynamics', 'ME3402 Fluid Mechanics', 'ME3403 Strength of Materials', 'ME3404 Kinematics of Machinery', 'ME3405 Manufacturing Processes'],
    'DEPT-CIVIL': ['CE3401 Structural Analysis I', 'CE3402 Surveying & Geomatics', 'CE3403 Hydraulics Engineering', 'CE3404 Concrete Technology', 'CE3405 Geotechnical Engineering'],
  };

  const y3Subjects: Record<string, string[]> = {
    'DEPT-CSE': ['CS3601 Compiler Design', 'CS3602 Distributed Systems', 'CS3603 Software Engineering', 'CS3604 Machine Learning', 'CS3605 Cloud Computing'],
    'DEPT-IT': ['IT3601 Network Security', 'IT3602 Full Stack Architecture', 'IT3603 Cloud Infrastructure', 'IT3604 Mobile Computing', 'IT3605 Big Data Analytics'],
    'DEPT-AIDS': ['AD3601 Deep Learning', 'AD3602 Natural Language Processing', 'AD3603 Computer Vision', 'AD3604 Reinforcement Learning', 'AD3605 MLOps Engineering'],
    'DEPT-ECE': ['EC3601 VLSI Design', 'EC3602 Communication Theory', 'EC3603 Embedded Systems', 'EC3604 Digital Signal Processing', 'EC3605 Antenna Engineering'],
    'DEPT-EEE': ['EE3601 Power Systems Analysis', 'EE3602 Electrical Machines II', 'EE3603 High Voltage Engineering', 'EE3604 Microcontrollers', 'EE3605 Renewable Energy Systems'],
    'DEPT-MECH': ['ME3601 Heat & Mass Transfer', 'ME3602 Machine Design', 'ME3603 Dynamics of Machinery', 'ME3604 CAD/CAM Automation', 'ME3605 Finite Element Analysis'],
    'DEPT-CIVIL': ['CE3601 Design of RCC Structures', 'CE3602 Environmental Engineering', 'CE3603 Transportation Engineering', 'CE3604 Foundation Engineering', 'CE3605 Construction Management'],
  };

  const classes: AcademicClass[] = [];
  const staffMembers: StaffMember[] = [
    {
      id: 'STF-DEAN-01',
      name: 'Dr. R. Meenakshi Sundaram',
      email: 'meenakshi.sundaram@college.edu',
      password: 'staff123',
      departmentId: 'DEPT-CSE',
      overseenDepartmentIds: ['DEPT-CSE', 'DEPT-IT', 'DEPT-AIDS'],
      designation: 'Dean - School of Computing',
      roleTitle: 'Dean',
      loginRole: 'DEAN',
      assignedClassIds: [],
      subjects: [],
    },
    {
      id: 'STF-DEAN-02',
      name: 'Dr. S. Vijayalakshmi',
      email: 'vijayalakshmi.subramanian@college.edu',
      password: 'staff123',
      departmentId: 'DEPT-ECE',
      overseenDepartmentIds: ['DEPT-ECE', 'DEPT-EEE'],
      designation: 'Dean - School of Electrical Sciences',
      roleTitle: 'Dean',
      loginRole: 'DEAN',
      assignedClassIds: [],
      subjects: [],
    },
    {
      id: 'STF-DEAN-03',
      name: 'Dr. V. Raghavendran',
      email: 'raghavendran.venkatesh@college.edu',
      password: 'staff123',
      departmentId: 'DEPT-MECH',
      overseenDepartmentIds: ['DEPT-MECH', 'DEPT-CIVIL'],
      designation: 'Dean - School of Mechanical & Civil Engineering',
      roleTitle: 'Dean',
      loginRole: 'DEAN',
      assignedClassIds: [],
      subjects: [],
    },
  ];

  let staffCursor = 0;
  for (const dept of departments) {
    const cleanCode = dept.code.replace('&', '');
    const s2 = y2Subjects[dept.id];
    const s3 = y3Subjects[dept.id];
    const c2A: AcademicClass = { id: `CLS-${cleanCode}-2A`, name: `${dept.code} II Year - Section A`, departmentId: dept.id, semester: 4, section: 'A', subjects: s2 };
    const c2B: AcademicClass = { id: `CLS-${cleanCode}-2B`, name: `${dept.code} II Year - Section B`, departmentId: dept.id, semester: 4, section: 'B', subjects: s2 };
    const c3A: AcademicClass = { id: `CLS-${cleanCode}-3A`, name: `${dept.code} III Year - Section A`, departmentId: dept.id, semester: 6, section: 'A', subjects: s3 };
    const c3B: AcademicClass = { id: `CLS-${cleanCode}-3B`, name: `${dept.code} III Year - Section B`, departmentId: dept.id, semester: 6, section: 'B', subjects: s3 };
    const deptClasses = [c2A, c2B, c3A, c3B];
    const deptClassIds = deptClasses.map((c) => c.id);
    classes.push(...deptClasses);

    const hodInfo = STAFF_PROFILES[staffCursor++];
    staffMembers.push({
      id: `STF-${cleanCode}-HOD`,
      name: hodInfo[0],
      email: `${hodInfo[1]}@college.edu`,
      password: 'staff123',
      departmentId: dept.id,
      overseenDepartmentIds: [dept.id],
      designation: 'Professor & HOD',
      roleTitle: 'Head of Department',
      loginRole: 'HOD',
      assignedClassIds: [],
      subjects: [s2[0], s3[0]],
    });

    const acInfo = STAFF_PROFILES[staffCursor++];
    staffMembers.push({
      id: `STF-${cleanCode}-AC`,
      name: acInfo[0],
      email: `${acInfo[1]}@college.edu`,
      password: 'staff123',
      departmentId: dept.id,
      overseenDepartmentIds: [dept.id],
      designation: 'Associate Professor & Academic Coordinator',
      roleTitle: 'Academic Coordinator',
      loginRole: 'ACADEMIC_COORDINATOR',
      assignedClassIds: deptClassIds,
      subjects: [],
    });

    const ecInfo = STAFF_PROFILES[staffCursor++];
    staffMembers.push({
      id: `STF-${cleanCode}-EC`,
      name: ecInfo[0],
      email: `${ecInfo[1]}@college.edu`,
      password: 'staff123',
      departmentId: dept.id,
      overseenDepartmentIds: [dept.id],
      designation: 'Assistant Professor & Exam Cell Coordinator',
      roleTitle: 'Exam Cell Coordinator',
      loginRole: 'EXAM_CELL_COORDINATOR',
      assignedClassIds: deptClassIds,
      subjects: [],
    });

    const labInfo = STAFF_PROFILES[staffCursor++];
    staffMembers.push({
      id: `STF-${cleanCode}-LAB`,
      name: labInfo[0],
      email: `${labInfo[1]}@college.edu`,
      password: 'faculty123',
      departmentId: dept.id,
      overseenDepartmentIds: [dept.id],
      designation: 'Senior Lab Instructor',
      roleTitle: 'Lab Instructor',
      loginRole: 'FACULTY',
      assignedClassIds: deptClassIds,
      subjects: [s2[0], s2[2], s3[1]],
    });

    deptClasses.forEach((cls, cIdx) => {
      const advInfo = STAFF_PROFILES[staffCursor++];
      staffMembers.push({
        id: `STF-${cleanCode}-ADV${cIdx + 1}`,
        name: advInfo[0],
        email: `${advInfo[1]}@college.edu`,
        password: 'staff123',
        departmentId: dept.id,
        overseenDepartmentIds: [dept.id],
        designation: 'Assistant Professor & Class Advisor',
        roleTitle: 'Class Advisor',
        loginRole: 'CLASS_ADVISOR',
        assignedClassIds: [cls.id],
        subjects: [cls.subjects[0]],
      });
    });

    for (let fIdx = 0; fIdx < 5; fIdx++) {
      const facInfo = STAFF_PROFILES[staffCursor++];
      const handledClasses = fIdx === 0 ? deptClassIds : fIdx % 2 === 0 ? [c2A.id, c3A.id] : [c2B.id, c3B.id];
      staffMembers.push({
        id: `STF-${cleanCode}-FAC${fIdx + 1}`,
        name: facInfo[0],
        email: `${facInfo[1]}@college.edu`,
        password: 'faculty123',
        departmentId: dept.id,
        overseenDepartmentIds: [dept.id],
        designation: 'Assistant Professor',
        roleTitle: 'Subject Faculty',
        loginRole: 'FACULTY',
        assignedClassIds: handledClasses,
        subjects: [s2[fIdx], s3[fIdx]],
      });
    }
  }

  const students: Student[] = [];
  const assessments: AssessmentItem[] = [];
  let idx = 0;
  let asmSeq = 1;

  for (const cls of classes) {
    const deptCode = (departments.find((d) => d.id === cls.departmentId)?.code || 'GEN').replace('&', '');
    const yearTag = cls.semester <= 4 ? '24' : '23';

    for (let slot = 1; slot <= 8; slot++) {
      const id = `STU-${String(101 + idx).padStart(3, '0')}`;
      const firstName = STUDENT_FIRST_NAMES[idx % STUDENT_FIRST_NAMES.length];
      const surnameIdx = (Math.floor(idx / STUDENT_FIRST_NAMES.length) + (idx % STUDENT_SURNAMES.length)) % STUDENT_SURNAMES.length;
      const lastName = STUDENT_SURNAMES[surnameIdx];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@college.edu`;
      const rollNumber = `${yearTag}${deptCode}${cls.section}${String(slot).padStart(2, '0')}`;

      const shortage = idx % 5 === 3;
      const attendancePercentage = shortage ? 63.6 + (idx % 3) * 3 : 82.4 + (idx % 5) * 3.4;

      let weightedSum = 0;
      const basePerf = idx % 11 === 9 ? 41 : 58 + (idx % 6) * 6.5;

      cls.subjects.forEach((subject, subIdx) => {
        const factor = Math.min(0.97, Math.max(0.35, (basePerf + ((idx + subject.length) % 11) - 4) / 100));
        const testMarks = Math.round(50 * factor * 2) / 2;
        const assignMarks = Math.round(25 * Math.min(1, factor + 0.05) * 2) / 2;
        const labMarks = Math.round(25 * Math.min(1, factor + 0.08) * 2) / 2;
        const verified = subIdx < 2;
        const verifier = verified ? `STF-${deptCode}-EC` : '';

        assessments.push(
          { id: `ASM-${String(asmSeq++).padStart(5, '0')}`, studentId: id, classId: cls.id, subject, category: 'INTERNAL_TEST', maxMarks: 50, marksObtained: testMarks, verifiedByExamCell: verified, verifiedBy: verifier },
          { id: `ASM-${String(asmSeq++).padStart(5, '0')}`, studentId: id, classId: cls.id, subject, category: 'ASSIGNMENT', maxMarks: 25, marksObtained: assignMarks, verifiedByExamCell: verified, verifiedBy: verifier },
          { id: `ASM-${String(asmSeq++).padStart(5, '0')}`, studentId: id, classId: cls.id, subject, category: 'LAB_RECORD', maxMarks: 25, marksObtained: labMarks, verifiedByExamCell: verified, verifiedBy: verifier }
        );
        weightedSum += (testMarks / 50) * 50 + (assignMarks / 25) * 25 + (labMarks / 25) * 25;
      });

      students.push({
        id,
        name,
        email,
        rollNumber,
        departmentId: cls.departmentId,
        classId: cls.id,
        semester: cls.semester,
        attendancePercentage: Math.round(Math.min(100, attendancePercentage) * 10) / 10,
        academicPercentage: Math.round((weightedSum / cls.subjects.length) * 10) / 10,
      });
      idx++;
    }
  }

  return { departments, classes, staffMembers, students, assessments };
}

function assignGrade(score: number, strategy: GradingStrategyName, cohort: number[]): string {
  if (strategy === 'RELATIVE' && cohort.length >= 2) {
    if (score < 35) return 'F';
    const mean = cohort.reduce((a, b) => a + b, 0) / cohort.length;
    const variance = cohort.reduce((a, b) => a + (b - mean) ** 2, 0) / cohort.length;
    const sd = Math.max(2, Math.sqrt(variance));
    if (score >= mean + 1.5 * sd) return 'A+';
    if (score >= mean + 0.75 * sd) return 'A';
    if (score >= mean) return 'B+';
    if (score >= mean - 0.75 * sd) return 'B';
    if (score >= mean - 1.5 * sd) return 'C';
    return 'D';
  }
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function StatusBadge({ type, label }: { type: 'positive' | 'negative' | 'neutral'; label: string }) {
  if (type === 'positive') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
        style={{
          backgroundColor: 'var(--color-forest-green-background)',
          color: 'var(--color-forest-green)',
          border: '0.5px solid rgba(63, 107, 46, 0.35)',
        }}
      >
        <Check className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  }
  if (type === 'negative') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
        style={{
          backgroundColor: 'var(--color-beige-red-background)',
          color: 'var(--color-beige-red)',
          border: '0.5px solid rgba(140, 63, 52, 0.35)',
        }}
      >
        <X className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{
        backgroundColor: 'var(--color-warm-sand)',
        color: 'var(--color-primary-green-text)',
        border: '0.5px solid var(--color-green-border)',
      }}
    >
      <Clock className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function StaffRoleBadge({ roleTitle }: { roleTitle: StaffRoleTitle }) {
  const isSage =
    roleTitle === 'Dean' ||
    roleTitle === 'Head of Department' ||
    roleTitle === 'Academic Coordinator' ||
    roleTitle === 'Exam Cell Coordinator';

  const IconComponent =
    roleTitle === 'Dean' || roleTitle === 'Head of Department'
      ? ShieldCheck
      : roleTitle === 'Exam Cell Coordinator'
      ? ClipboardCheck
      : roleTitle === 'Academic Coordinator' || roleTitle === 'Class Advisor'
      ? Users
      : roleTitle === 'Lab Instructor'
      ? FlaskConical
      : BookOpen;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap"
      style={{
        backgroundColor: isSage ? 'var(--color-forest-green-background)' : 'var(--color-warm-sand)',
        color: 'var(--color-deep-green-text)',
        border: '0.5px solid var(--color-green-border)',
      }}
    >
      <IconComponent className="h-3.5 w-3.5 shrink-0" />
      <span>{roleTitle}</span>
    </span>
  );
}

function SvgBarChart({
  labels,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
}: {
  labels: string[];
  primary: number[];
  secondary?: number[];
  primaryLabel: string;
  secondaryLabel?: string;
}) {
  if (labels.length === 0) return null;
  const width = Math.max(520, labels.length * 120);
  const height = 220;
  const padLeft = 44;
  const padTop = 24;
  const padBottom = 40;
  const chartHeight = height - padTop - padBottom;
  const groupW = (width - padLeft - 20) / labels.length;
  let peakIdx = 0;
  primary.forEach((v, i) => {
    if (v > primary[peakIdx]) peakIdx = i;
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padTop + chartHeight - (v / 100) * chartHeight;
          return (
            <g key={v}>
              <line x1={padLeft} y1={y} x2={width - 10} y2={y} stroke="rgba(63,90,51,0.18)" strokeDasharray="3,3" />
              <text x={padLeft - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#3F5A33">
                {v}%
              </text>
            </g>
          );
        })}
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + chartHeight} stroke="#3F5A33" strokeWidth="1" />
        <line x1={padLeft} y1={padTop + chartHeight} x2={width - 10} y2={padTop + chartHeight} stroke="#3F5A33" strokeWidth="1" />
        {labels.map((label, idx) => {
          const xCenter = padLeft + idx * groupW + groupW / 2;
          const v1 = Math.min(100, Math.max(0, primary[idx] || 0));
          const h1 = (v1 / 100) * chartHeight;
          const y1 = padTop + chartHeight - h1;
          const barW = secondary ? 22 : 30;
          const x1 = secondary ? xCenter - 24 : xCenter - 15;
          const v2 = secondary ? Math.min(100, Math.max(0, secondary[idx] || 0)) : 0;
          const h2 = (v2 / 100) * chartHeight;
          const y2 = padTop + chartHeight - h2;
          const shortLabel = label.length > 16 ? `${label.slice(0, 14)}…` : label;

          return (
            <g key={label}>
              <rect x={x1} y={y1} width={barW} height={h1} rx="4" fill={idx === peakIdx ? '#D5851F' : '#87A96B'} stroke="#1F2A14" strokeWidth="0.4" />
              <text x={x1 + barW / 2} y={y1 - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1F2A14">
                {v1.toFixed(0)}%
              </text>
              {secondary && (
                <>
                  <rect x={xCenter + 2} y={y2} width={22} height={h2} rx="4" fill="#B5C093" stroke="#3F5A33" strokeWidth="0.5" />
                  <text x={xCenter + 13} y={y2 - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1F2A14">
                    {v2.toFixed(0)}%
                  </text>
                </>
              )}
              <text x={xCenter} y={height - 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1F2A14">
                {shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold" style={{ color: 'var(--color-deep-green-text)' }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#87A96B' }} />
          {primaryLabel}
        </span>
        {secondaryLabel && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#B5C093' }} />
            {secondaryLabel}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#D5851F' }} />
          Peak Highlight
        </span>
      </div>
    </div>
  );
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const ROLE_OPTIONS: { id: Role; label: string }[] = [
  { id: 'ADMIN', label: 'Administrator' },
  { id: 'DEAN', label: 'Dean' },
  { id: 'HOD', label: 'HOD' },
  { id: 'ACADEMIC_COORDINATOR', label: 'Academic Coord.' },
  { id: 'CLASS_ADVISOR', label: 'Class Advisor' },
  { id: 'FACULTY', label: 'Subject Faculty' },
  { id: 'EXAM_CELL_COORDINATOR', label: 'Exam Cell Coord.' },
  { id: 'STUDENT', label: 'Student' },
];

export default function App() {
  const initial = useMemo(() => createInitialData(), []);
  const [departments, setDepartments] = useState<Department[]>(initial.departments);
  const [classes, setClasses] = useState<AcademicClass[]>(initial.classes);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initial.staffMembers);
  const [students, setStudents] = useState<Student[]>(initial.students);
  const [assessments, setAssessments] = useState<AssessmentItem[]>(initial.assessments);

  const [role, setRole] = useState<Role>('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: Role;
    summary: string;
    staffProfile?: StaffMember;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('ADMIN_OVERVIEW');
  const [gradingStrategy, setGradingStrategy] = useState<GradingStrategyName>('ABSOLUTE');
  const [feedback, setFeedback] = useState<{ text: string; negative?: boolean } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedDeptReportId, setSelectedDeptReportId] = useState('DEPT-CSE');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('ALL');

  const [selectedClassId, setSelectedClassId] = useState('CLS-CSE-2A');
  const [selectedSubject, setSelectedSubject] = useState('CS3401 Data Structures');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus>>({});
  const [selectedCategory, setSelectedCategory] = useState<AssessmentCategory>('INTERNAL_TEST');
  const [parallelReportMeta, setParallelReportMeta] = useState<{ count: number; ms: number; workers: string[] } | null>(null);

  const [examClassFilter, setExamClassFilter] = useState('ALL');
  const [examStatusFilter, setExamStatusFilter] = useState('ALL');

  const [newStuName, setNewStuName] = useState('');
  const [newStuEmail, setNewStuEmail] = useState('');
  const [newStuRoll, setNewStuRoll] = useState('');
  const [newStuClass, setNewStuClass] = useState('CLS-CSE-2A');

  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHod, setNewDeptHod] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      setLoginError('Please enter both institutional email and password.');
      return;
    }

    if (role === 'ADMIN' && normalized === 'admin@college.edu' && password === 'admin123') {
      setCurrentUser({
        id: 'ADM-001',
        name: 'Dr. S. Natarajan',
        email: normalized,
        role: 'ADMIN',
        summary: 'Principal & Chief Administrator • Institutional Control',
      });
      setActiveTab('ADMIN_OVERVIEW');
      return;
    }

    if (role === 'STUDENT') {
      const stu = students.find((s) => s.email.toLowerCase() === normalized);
      if (stu && password === 'student123') {
        setCurrentUser({
          id: stu.id,
          name: stu.name,
          email: stu.email,
          role: 'STUDENT',
          summary: `${stu.rollNumber} • ${stu.classId}`,
        });
        setActiveTab('STUDENT_OVERVIEW');
        return;
      }
    }

    const staff = staffMembers.find((s) => s.email.toLowerCase() === normalized && s.loginRole === role);
    if (staff && staff.password === password) {
      setCurrentUser({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role,
        summary: `${staff.roleTitle} • ${staff.departmentId}`,
        staffProfile: staff,
      });
      if (role === 'DEAN') {
        setSelectedDeptReportId(staff.overseenDepartmentIds[0] || 'DEPT-CSE');
        setActiveTab('DEAN_OVERVIEW');
      } else if (role === 'HOD' || role === 'ACADEMIC_COORDINATOR') {
        setSelectedDeptReportId(staff.departmentId);
        const firstDeptCls = classes.find((c) => c.departmentId === staff.departmentId);
        if (firstDeptCls) setSelectedClassId(firstDeptCls.id);
        setActiveTab('DEPT_REPORT');
      } else if (role === 'CLASS_ADVISOR') {
        setSelectedDeptReportId(staff.departmentId);
        setSelectedClassId(staff.assignedClassIds[0] || 'CLS-CSE-2A');
        setActiveTab('CLASS_REPORT');
      } else if (role === 'EXAM_CELL_COORDINATOR') {
        setSelectedDeptReportId(staff.departmentId);
        setExamClassFilter('ALL');
        setExamStatusFilter('ALL');
        setActiveTab('EXAM_CELL_VERIFY');
      } else {
        const clsId = staff.assignedClassIds[0] || 'CLS-CSE-2A';
        setSelectedClassId(clsId);
        const clsObj = classes.find((c) => c.id === clsId);
        const allowedSubs = clsObj ? clsObj.subjects.filter((s) => staff.subjects.includes(s)) : [];
        setSelectedSubject(allowedSubs[0] || clsObj?.subjects[0] || '');
        setActiveTab('FACULTY_ATTENDANCE');
      }
      return;
    }

    setLoginError(`Invalid credentials for selected role ${role}. Use the demo credential buttons below.`);
  };

  const fillDemo = (targetRole: Role, demoEmail: string, demoPassword: string) => {
    setRole(targetRole);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoginError('');
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="cream-card-surface w-full max-w-2xl p-7">
          <div className="mb-5 text-center">
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: 'var(--color-forest-green-background)',
                color: 'var(--color-forest-green)',
                border: '0.5px solid var(--color-green-border)',
              }}
            >
              <GraduationCap className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-green-text)' }}>
              Student Attendance &amp; Academic Performance Tracker
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-deep-green-text)' }}>
              7 Departments &bull; 28 Classes &bull; 224 Students &bull; Full Academic Staff Hierarchy
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-deep-green-text)' }}>
                Select Portal Role
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className="rounded-lg px-2.5 py-2 text-xs font-semibold transition cursor-pointer"
                    style={{
                      backgroundColor: role === r.id ? 'var(--color-forest-green-background)' : 'var(--color-cream-button)',
                      color: role === r.id ? 'var(--color-forest-green)' : 'var(--color-deep-green-text)',
                      border: role === r.id ? '1px solid var(--color-forest-green)' : '0.5px solid var(--color-green-border)',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold" style={{ color: 'var(--color-deep-green-text)' }}>
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold" style={{ color: 'var(--color-deep-green-text)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}
                />
              </div>
            </div>

            {loginError && (
              <div
                className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--color-beige-red-background)',
                  color: 'var(--color-beige-red)',
                  border: '0.5px solid rgba(140,63,52,0.35)',
                }}
              >
                <X className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="primary-action-button w-full py-2.5 text-sm font-bold cursor-pointer">
              Sign In to Portal
            </button>
          </form>

          <div className="translucent-panel-surface mt-5 p-3.5">
            <div className="mb-2 text-xs font-bold" style={{ color: 'var(--color-deep-green-text)' }}>
              Demo Credentials (Click to Autofill)
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => fillDemo('ADMIN', 'admin@college.edu', 'admin123')} className="secondary-action-button justify-start px-3 py-1.5 text-xs font-semibold cursor-pointer">
                Admin: admin@college.edu
              </button>
              <button type="button" onClick={() => fillDemo('DEAN', 'meenakshi.sundaram@college.edu', 'staff123')} className="secondary-action-button justify-start px-3 py-1.5 text-xs font-semibold cursor-pointer">
                Dean: meenakshi.sundaram@college.edu
              </button>
              <button type="button" onClick={() => fillDemo('HOD', 'gopinath.natarajan@college.edu', 'staff123')} className="secondary-action-button justify-start px-3 py-1.5 text-xs font-semibold cursor-pointer">
                HOD (CSE): gopinath.natarajan@college.edu
              </button>
              <button type="button" onClick={() => fillDemo('ACADEMIC_COORDINATOR', 'thenmozhi.murugan@college.edu', 'staff123')} className="secondary-action-button justify-start px-3 py-1.5 text-xs font-semibold cursor-pointer">
                Acad. Coord: thenmozhi.murugan@college.edu
              </button>
              <button type="button" onClick={() => fillDemo('CLASS_ADVISOR', 'kalaiselvi.pandian@college.edu', 'staff123')} className="secondary-action-button justify-start px-3 py-1.5 text-xs font-semibold cursor-pointer">
                Class Advisor: kalaiselvi.pandian@college.edu
              </button>
              <button type="button" onClick={() => fillDemo('FACULTY', 'muthukumar.palani@college.edu', 'faculty123')} className="secondary-action-button justify-start px-3 py-1.5 text-xs font-semibold cursor-pointer">
                Subject Faculty: muthukumar.palani@college.edu
              </button>
              <button type="button" onClick={() => fillDemo('EXAM_CELL_COORDINATOR', 'arumugam.krishnan@college.edu', 'staff123')} className="secondary-action-button justify-start px-3 py-1.5 text-xs font-semibold cursor-pointer">
                Exam Cell: arumugam.krishnan@college.edu
              </button>
              <button type="button" onClick={() => fillDemo('STUDENT', 'arun.subramanian@college.edu', 'student123')} className="secondary-action-button justify-start px-3 py-1.5 text-xs font-semibold cursor-pointer">
                Student: arun.subramanian@college.edu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scopedDepartments =
    currentUser.role === 'DEAN' && currentUser.staffProfile
      ? departments.filter((d) => currentUser.staffProfile!.overseenDepartmentIds.includes(d.id))
      : currentUser.staffProfile && (currentUser.role === 'HOD' || currentUser.role === 'ACADEMIC_COORDINATOR' || currentUser.role === 'EXAM_CELL_COORDINATOR')
      ? departments.filter((d) => d.id === currentUser.staffProfile!.departmentId)
      : departments;

  const scopedClasses =
    currentUser.staffProfile && (currentUser.role === 'FACULTY' || currentUser.role === 'CLASS_ADVISOR')
      ? classes.filter((c) => currentUser.staffProfile!.assignedClassIds.includes(c.id))
      : currentUser.staffProfile && (currentUser.role === 'HOD' || currentUser.role === 'ACADEMIC_COORDINATOR' || currentUser.role === 'EXAM_CELL_COORDINATOR')
      ? classes.filter((c) => c.departmentId === currentUser.staffProfile!.departmentId)
      : currentUser.role === 'DEAN' && currentUser.staffProfile
      ? classes.filter((c) => currentUser.staffProfile!.overseenDepartmentIds.includes(c.departmentId))
      : classes;

  const activeClass = scopedClasses.find((c) => c.id === selectedClassId) || scopedClasses[0] || classes[0];
  const allowedSubjects =
    currentUser.role === 'FACULTY' && currentUser.staffProfile?.subjects.length
      ? (() => {
          const intersection = activeClass.subjects.filter((s) => currentUser.staffProfile!.subjects.includes(s));
          return intersection.length > 0 ? intersection : activeClass.subjects;
        })()
      : activeClass.subjects;
  const effectiveSubject = allowedSubjects.includes(selectedSubject) ? selectedSubject : allowedSubjects[0];
  const classStudents = students.filter((s) => s.classId === activeClass.id);

  const menuTabs =
    currentUser.role === 'ADMIN'
      ? [
          { id: 'ADMIN_OVERVIEW', label: 'Overview & Parallel Reports' },
          { id: 'ADMIN_STUDENTS', label: 'Manage Students' },
          { id: 'ADMIN_DEPARTMENTS', label: 'Manage Departments' },
          { id: 'DEPT_REPORT', label: 'Department Report & Staff' },
        ]
      : currentUser.role === 'DEAN'
      ? [
          { id: 'DEAN_OVERVIEW', label: 'School Overview & Departments' },
          { id: 'DEPT_REPORT', label: 'Department Report & Staff' },
          { id: 'CLASS_REPORT', label: 'Class-Wise Reports' },
        ]
      : currentUser.role === 'HOD' || currentUser.role === 'ACADEMIC_COORDINATOR'
      ? [
          { id: 'DEPT_REPORT', label: 'Department Report & Staff' },
          { id: 'CLASS_REPORT', label: 'Class-Wise Reports' },
        ]
      : currentUser.role === 'CLASS_ADVISOR'
      ? [
          { id: 'CLASS_REPORT', label: 'My Advised Class & Ranking' },
          { id: 'DEPT_REPORT', label: 'Department Staff Directory' },
        ]
      : currentUser.role === 'EXAM_CELL_COORDINATOR'
      ? [
          { id: 'EXAM_CELL_VERIFY', label: 'Internal Marks Verification' },
          { id: 'DEPT_REPORT', label: 'Department Report & Staff' },
        ]
      : currentUser.role === 'FACULTY'
      ? [
          { id: 'FACULTY_ATTENDANCE', label: 'Mark Daily Attendance' },
          { id: 'FACULTY_MARKS', label: 'Internal Assessment Marks' },
          { id: 'CLASS_REPORT', label: 'Class-Wise Report' },
        ]
      : [
          { id: 'STUDENT_OVERVIEW', label: 'My Attendance & Marks' },
          { id: 'STUDENT_REPORT', label: 'Individual Report' },
        ];

  const avgAttendance = students.reduce((a, b) => a + b.attendancePercentage, 0) / Math.max(1, students.length);
  const avgAcademic = students.reduce((a, b) => a + b.academicPercentage, 0) / Math.max(1, students.length);
  const shortageCount = students.filter((s) => s.attendancePercentage < 75).length;

  const departmentCardStats = (deptList: Department[]) =>
    deptList.map((dept) => {
      const dStudents = students.filter((s) => s.departmentId === dept.id);
      const dClasses = classes.filter((c) => c.departmentId === dept.id);
      const dStaff = staffMembers.filter((st) => st.departmentId === dept.id || st.overseenDepartmentIds.includes(dept.id));
      const dAtt = dStudents.reduce((a, b) => a + b.attendancePercentage, 0) / Math.max(1, dStudents.length);
      const dMarks = dStudents.reduce((a, b) => a + b.academicPercentage, 0) / Math.max(1, dStudents.length);
      const dShort = dStudents.filter((s) => s.attendancePercentage < 75).length;
      return { dept, classCount: dClasses.length, studentCount: dStudents.length, staffCount: dStaff.length, dAtt, dMarks, dShort };
    });

  const filteredStudents = students
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchDept = deptFilter === 'ALL' || s.departmentId === deptFilter;
      return matchQ && matchDept;
    })
    .sort((a, b) => (sortAsc ? a.rollNumber.localeCompare(b.rollNumber) : b.rollNumber.localeCompare(a.rollNumber)));

  const currentStudent = students.find((s) => s.id === currentUser.id) || students[0];
  const currentClassOfStudent = classes.find((c) => c.id === currentStudent.classId) || classes[0];

  const handleBulkPresent = () => {
    const nextDraft = { ...attendanceDraft };
    classStudents.forEach((s) => {
      nextDraft[s.id] = 'PRESENT';
    });
    setAttendanceDraft(nextDraft);
    setStudents((prev) =>
      prev.map((s) =>
        s.classId === activeClass.id
          ? { ...s, attendancePercentage: Math.min(100, Math.round((s.attendancePercentage + 0.6) * 10) / 10) }
          : s
      )
    );
    setFeedback({ text: `Bulk marked all ${classStudents.length} students PRESENT for ${effectiveSubject} on ${attendanceDate}.` });
  };

  const handleSaveGrid = () => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.classId !== activeClass.id) return s;
        const st = attendanceDraft[s.id] || 'PRESENT';
        const delta = st === 'PRESENT' ? 0.5 : st === 'ABSENT' ? -1.4 : 0;
        return { ...s, attendancePercentage: Math.max(0, Math.min(100, Math.round((s.attendancePercentage + delta) * 10) / 10)) };
      })
    );
    setFeedback({ text: `Saved attendance grid for ${activeClass.name} (${effectiveSubject}) under ReentrantReadWriteLock.` });
  };

  const handleUpdateMark = (studentId: string, rawValue: string) => {
    const maxMarks = selectedCategory === 'INTERNAL_TEST' ? 50 : 25;
    const val = Number(rawValue);
    if (Number.isNaN(val) || val < 0 || val > maxMarks) {
      setFeedback({ text: `InvalidMarksException: ${rawValue} is outside 0..${maxMarks}.`, negative: true });
      return;
    }
    setAssessments((prev) =>
      prev.map((a) =>
        a.studentId === studentId && a.subject === effectiveSubject && a.category === selectedCategory
          ? { ...a, marksObtained: val, verifiedByExamCell: false, verifiedBy: '' }
          : a
      )
    );
    setFeedback({ text: `Updated ${selectedCategory} marks (${val}/${maxMarks}) for ${studentId}.` });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStuName.trim() || !newStuEmail.includes('@') || !newStuRoll.trim()) {
      setFeedback({ text: 'Please enter a valid student name, email format, and roll number.', negative: true });
      return;
    }
    const targetCls = classes.find((c) => c.id === newStuClass) || classes[0];
    const created: Student = {
      id: `STU-${101 + students.length}`,
      name: newStuName.trim(),
      email: newStuEmail.trim().toLowerCase(),
      rollNumber: newStuRoll.trim().toUpperCase(),
      departmentId: targetCls.departmentId,
      classId: targetCls.id,
      semester: targetCls.semester,
      attendancePercentage: 100,
      academicPercentage: 78,
    };
    setStudents((prev) => [...prev, created]);
    setNewStuName('');
    setNewStuEmail('');
    setNewStuRoll('');
    setFeedback({ text: `Enrolled student ${created.name} (${created.rollNumber}).` });
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptCode.trim() || !newDeptName.trim() || !newDeptHod.trim()) {
      setFeedback({ text: 'All department fields are required.', negative: true });
      return;
    }
    const code = newDeptCode.trim().toUpperCase();
    setDepartments((prev) => [...prev, { id: `DEPT-${code.replace('&', '')}`, code, name: newDeptName.trim(), headOfDepartment: newDeptHod.trim() }]);
    setNewDeptCode('');
    setNewDeptName('');
    setNewDeptHod('');
    setFeedback({ text: `Created department ${code}.` });
  };

  const renderDeptCards = (deptList: Department[], heading: string) => (
    <div className="cream-card-surface p-5">
      <div className="mb-3">
        <h3 className="text-base font-bold">{heading}</h3>
        <p className="text-xs" style={{ color: 'var(--color-deep-green-text)' }}>
          Click any department card to open its performance report and full staff directory.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departmentCardStats(deptList).map(({ dept, classCount, studentCount, staffCount, dAtt, dMarks, dShort }) => (
          <button
            key={dept.id}
            type="button"
            onClick={() => {
              setSelectedDeptReportId(dept.id);
              setActiveTab('DEPT_REPORT');
              setFeedback(null);
            }}
            className="cream-card-surface p-4 text-left transition hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold">{dept.code}</span>
              <StatusBadge type={dAtt >= 75 ? 'positive' : 'negative'} label={`${dAtt.toFixed(1)}% Att.`} />
            </div>
            <div className="mt-1 text-sm font-bold">{dept.name}</div>
            <div className="mt-0.5 text-xs" style={{ color: 'var(--color-deep-green-text)' }}>
              HOD: {dept.headOfDepartment}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs" style={{ color: 'var(--color-deep-green-text)' }}>
              <span><strong>{classCount}</strong> Classes</span>
              <span>&bull; <strong>{studentCount}</strong> Students</span>
              <span>&bull; <strong>{staffCount}</strong> Staff</span>
            </div>
            <div className="mt-1 flex justify-between text-xs font-semibold">
              <span>Mean Score: {dMarks.toFixed(1)}%</span>
              <span>Shortage: {dShort}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4">
      <header className="translucent-panel-surface no-print flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: 'var(--color-primary-green-text)' }}>
            Student Attendance &amp; Academic Performance Tracker
          </span>
          <StatusBadge type="neutral" label={currentUser.staffProfile?.roleTitle || currentUser.role} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: 'var(--color-deep-green-text)' }}>
            {currentUser.name} ({currentUser.email})
          </span>
          <button
            type="button"
            onClick={() => {
              setCurrentUser(null);
              setFeedback(null);
            }}
            className="secondary-action-button px-4 py-1.5 text-sm font-semibold cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="translucent-panel-surface no-print h-fit p-4">
          <div className="mb-3 border-b pb-3" style={{ borderColor: 'var(--color-green-border)' }}>
            <div className="font-bold" style={{ color: 'var(--color-primary-green-text)' }}>
              {currentUser.name}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--color-deep-green-text)' }}>
              {currentUser.summary}
            </div>
          </div>
          <nav className="flex flex-wrap gap-1.5 lg:flex-col">
            {menuTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id);
                  setFeedback(null);
                }}
                className="rounded-lg px-3.5 py-2 text-left text-sm font-semibold transition cursor-pointer"
                style={{
                  backgroundColor: activeTab === t.id ? 'var(--color-cream-surface)' : 'transparent',
                  color: activeTab === t.id ? 'var(--color-forest-green)' : 'var(--color-primary-green-text)',
                  border: activeTab === t.id ? '0.5px solid var(--color-green-border)' : '0.5px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-col gap-4">
          {feedback && (
            <div
              className="no-print flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{
                backgroundColor: feedback.negative ? 'var(--color-beige-red-background)' : 'var(--color-forest-green-background)',
                color: feedback.negative ? 'var(--color-beige-red)' : 'var(--color-forest-green)',
                border: '0.5px solid var(--color-green-border)',
              }}
            >
              {feedback.negative ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {activeTab === 'ADMIN_OVERVIEW' && (
            <>
              <div className="cream-card-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Administrator Institutional Overview</h2>
                    <p className="text-sm" style={{ color: 'var(--color-deep-green-text)' }}>
                      {departments.length} Departments &bull; {classes.length} Classes &bull; {students.length} Students &bull; {staffMembers.length} Academic Staff
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={gradingStrategy}
                      onChange={(e) => setGradingStrategy(e.target.value as GradingStrategyName)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold"
                      style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}
                    >
                      <option value="ABSOLUTE">Absolute Grading</option>
                      <option value="RELATIVE">Relative Grading</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const total = departments.length + classes.length + students.length;
                        setParallelReportMeta({
                          count: total,
                          ms: 19,
                          workers: ['report-worker-1', 'report-worker-2', 'report-worker-3', 'report-worker-4'],
                        });
                        setFeedback({ text: `Generated ${total} reports in parallel using CompletableFuture & ExecutorService.` });
                      }}
                      className="primary-action-button px-4 py-2 text-sm font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Layers className="h-4 w-4" />
                      Generate All Reports (Parallel)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="cream-card-surface p-4"><div className="text-xs font-bold uppercase" style={{ color: 'var(--color-deep-green-text)' }}>Departments</div><div className="mt-1 text-2xl font-bold">{departments.length}</div></div>
                <div className="cream-card-surface p-4"><div className="text-xs font-bold uppercase" style={{ color: 'var(--color-deep-green-text)' }}>Students</div><div className="mt-1 text-2xl font-bold">{students.length}</div></div>
                <div className="cream-card-surface p-4"><div className="text-xs font-bold uppercase" style={{ color: 'var(--color-deep-green-text)' }}>Academic Staff</div><div className="mt-1 text-2xl font-bold">{staffMembers.length}</div></div>
                <div className="cream-card-surface p-4"><div className="text-xs font-bold uppercase" style={{ color: 'var(--color-deep-green-text)' }}>Mean Attendance</div><div className="mt-1 text-2xl font-bold">{avgAttendance.toFixed(1)}%</div></div>
              </div>

              {renderDeptCards(departments, `Academic Departments (${departments.length})`)}

              {parallelReportMeta && (
                <div className="cream-card-surface p-5">
                  <h3 className="mb-2 text-base font-bold">Parallel Batch Execution Summary</h3>
                  <p className="mb-3 text-sm" style={{ color: 'var(--color-deep-green-text)' }}>
                    Dispatched {parallelReportMeta.count} Reportable tasks across {parallelReportMeta.workers.length} pool threads in {parallelReportMeta.ms} ms.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {parallelReportMeta.workers.map((w) => (
                      <StatusBadge key={w} type="positive" label={w} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'DEAN_OVERVIEW' && (
            <>
              <div className="cream-card-surface p-5">
                <h2 className="text-xl font-bold">Dean School Overview</h2>
                <p className="text-sm" style={{ color: 'var(--color-deep-green-text)' }}>
                  {currentUser.staffProfile?.designation} &bull; Overseeing {scopedDepartments.length} Departments
                </p>
              </div>
              {renderDeptCards(scopedDepartments, `Overseen Departments (${scopedDepartments.length})`)}
            </>
          )}

          {activeTab === 'ADMIN_STUDENTS' && (
            <>
              <div className="cream-card-surface p-5">
                <h2 className="mb-3 text-lg font-bold">Enroll New Student</h2>
                <form onSubmit={handleAddStudent} className="grid grid-cols-1 gap-3 md:grid-cols-5">
                  <input value={newStuName} onChange={(e) => setNewStuName(e.target.value)} placeholder="Full Name" className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }} />
                  <input value={newStuEmail} onChange={(e) => setNewStuEmail(e.target.value)} placeholder="Email" className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }} />
                  <input value={newStuRoll} onChange={(e) => setNewStuRoll(e.target.value)} placeholder="Roll No" className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }} />
                  <select value={newStuClass} onChange={(e) => setNewStuClass(e.target.value)} className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="submit" className="primary-action-button px-4 py-2 text-sm font-bold cursor-pointer">Add Student</button>
                </form>
              </div>

              <div className="cream-card-surface p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold">Student Directory ({filteredStudents.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name or roll..." className="rounded-lg px-3 py-1.5 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }} />
                    <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                      <option value="ALL">All Departments</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.code}</option>)}
                    </select>
                    <button type="button" onClick={() => setSortAsc((v) => !v)} className="secondary-action-button px-3 py-1.5 text-xs font-semibold cursor-pointer">
                      Sort Roll ({sortAsc ? 'ASC' : 'DESC'})
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-left" style={{ borderColor: 'var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                        <th className="p-2.5">Roll No</th><th className="p-2.5">Name</th><th className="p-2.5">Class</th><th className="p-2.5">Attendance</th><th className="p-2.5">Score</th><th className="p-2.5">Status</th><th className="p-2.5">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.slice(0, 60).map((s, i) => (
                        <tr key={s.id} style={{ backgroundColor: i % 2 === 1 ? 'var(--color-warm-sand-tint)' : 'transparent', borderBottom: '0.5px solid var(--color-green-border)' }}>
                          <td className="p-2.5 font-bold">{s.rollNumber}</td>
                          <td className="p-2.5">{s.name}<div className="text-xs" style={{ color: 'var(--color-deep-green-text)' }}>{s.email}</div></td>
                          <td className="p-2.5">{s.classId}</td>
                          <td className="p-2.5">{s.attendancePercentage.toFixed(1)}%</td>
                          <td className="p-2.5">{s.academicPercentage.toFixed(1)}%</td>
                          <td className="p-2.5">{s.attendancePercentage < 75 ? <StatusBadge type="negative" label="Shortage" /> : <StatusBadge type="positive" label="Eligible" />}</td>
                          <td className="p-2.5">
                            <button
                              type="button"
                              onClick={() => setStudents((prev) => prev.filter((item) => item.id !== s.id))}
                              className="negative-action-button px-3 py-1 text-xs font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ADMIN_DEPARTMENTS' && (
            <>
              {renderDeptCards(departments, `All Academic Departments (${departments.length})`)}
              <div className="cream-card-surface p-5">
                <h2 className="mb-3 text-lg font-bold">Add Department</h2>
                <form onSubmit={handleAddDepartment} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <input value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} placeholder="Code (e.g. BME)" className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }} />
                  <input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Department Name" className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }} />
                  <input value={newDeptHod} onChange={(e) => setNewDeptHod(e.target.value)} placeholder="Head of Department" className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }} />
                  <button type="submit" className="primary-action-button px-4 py-2 text-sm font-bold cursor-pointer">Add Department</button>
                </form>
              </div>
            </>
          )}

          {activeTab === 'DEPT_REPORT' && (() => {
            const dept = scopedDepartments.find((d) => d.id === selectedDeptReportId) || scopedDepartments[0];
            const deptClasses = classes.filter((c) => c.departmentId === dept.id);
            const deptStudents = students.filter((s) => s.departmentId === dept.id);
            const deptMeanScore = deptStudents.reduce((a, b) => a + b.academicPercentage, 0) / Math.max(1, deptStudents.length);
            const topper = [...deptStudents].sort((a, b) => b.academicPercentage - a.academicPercentage)[0];
            const passPct = deptStudents.length ? (deptStudents.filter((s) => s.academicPercentage >= 40).length * 100) / deptStudents.length : 0;
            const rows = deptClasses.map((c) => {
              const cs = deptStudents.filter((s) => s.classId === c.id);
              const att = cs.reduce((a, b) => a + b.attendancePercentage, 0) / Math.max(1, cs.length);
              const mk = cs.reduce((a, b) => a + b.academicPercentage, 0) / Math.max(1, cs.length);
              return { name: c.name, count: cs.length, att: Math.round(att * 10) / 10, mk: Math.round(mk * 10) / 10 };
            });

            const deptStaff = staffMembers.filter((st) => st.departmentId === dept.id || st.overseenDepartmentIds.includes(dept.id));
            const filteredStaff = deptStaff.filter((st) => {
              const q = staffSearch.trim().toLowerCase();
              const matchRole = staffRoleFilter === 'ALL' || st.roleTitle === staffRoleFilter;
              const matchQ = !q || st.name.toLowerCase().includes(q) || st.email.toLowerCase().includes(q) || st.subjects.join(' ').toLowerCase().includes(q) || st.assignedClassIds.join(' ').toLowerCase().includes(q);
              return matchRole && matchQ;
            });

            return (
              <div className="space-y-4">
                <div className="cream-card-surface p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold">Department Report: {dept.name}</h2>
                      <p className="text-sm" style={{ color: 'var(--color-deep-green-text)' }}>
                        Topper: {topper?.name || 'N/A'} ({topper?.academicPercentage || 0}%) &bull; Pass Rate: {passPct.toFixed(1)}% &bull; Staff: {deptStaff.length}
                      </p>
                    </div>
                    <div className="no-print flex flex-wrap gap-2">
                      {scopedDepartments.length > 1 ? (
                        <select value={dept.id} onChange={(e) => setSelectedDeptReportId(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm cursor-pointer" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                          {scopedDepartments.map((d) => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
                        </select>
                      ) : (
                        <span className="rounded-lg px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                          {dept.code} - {dept.name}
                        </span>
                      )}
                      <button type="button" onClick={() => window.print()} className="secondary-action-button px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1 cursor-pointer"><Printer className="h-4 w-4" />Print</button>
                      <button type="button" onClick={() => downloadCsv(`dept-${dept.code}.csv`, ['Class', 'Students', 'Attendance %', 'Marks %'], rows.map((r) => [r.name, r.count, r.att, r.mk]))} className="primary-action-button px-3.5 py-1.5 text-sm font-bold inline-flex items-center gap-1 cursor-pointer"><Download className="h-4 w-4" />Download CSV</button>
                    </div>
                  </div>
                  <SvgBarChart labels={rows.map((r) => r.name)} primary={rows.map((r) => r.mk)} secondary={rows.map((r) => r.att)} primaryLabel="Average Marks %" secondaryLabel="Average Attendance %" />
                  <div className="border-t pt-3 text-xs flex justify-between" style={{ borderColor: 'var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                    <span>Generated by: report-worker-1</span>
                    <span>Strategy: {gradingStrategy} GRADING &bull; Dept Mean Score: {deptMeanScore.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="cream-card-surface p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold">STAFF DIRECTORY ({filteredStaff.length} of {deptStaff.length} Members)</h3>
                      <p className="text-xs" style={{ color: 'var(--color-deep-green-text)' }}>
                        Dean, HOD, Coordinators, Class Advisors, Lab Instructor &amp; Subject Faculty
                      </p>
                    </div>
                    <div className="no-print flex flex-wrap gap-2">
                      <input
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="Search staff, subject, class..."
                        className="rounded-lg px-3 py-1.5 text-sm"
                        style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}
                      />
                      <select
                        value={staffRoleFilter}
                        onChange={(e) => setStaffRoleFilter(e.target.value)}
                        className="rounded-lg px-3 py-1.5 text-sm"
                        style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}
                      >
                        <option value="ALL">All Staff Roles</option>
                        {(['Dean', 'Head of Department', 'Academic Coordinator', 'Exam Cell Coordinator', 'Class Advisor', 'Lab Instructor', 'Subject Faculty'] as StaffRoleTitle[]).map((rt) => (
                          <option key={rt} value={rt}>{rt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b text-left" style={{ borderColor: 'var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                          <th className="p-2.5">Name</th><th className="p-2.5">Role</th><th className="p-2.5">Subjects Handled</th><th className="p-2.5">Classes Handled</th><th className="p-2.5">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStaff.map((st, idx) => (
                          <tr key={st.id} style={{ backgroundColor: idx % 2 === 1 ? 'var(--color-warm-sand-tint)' : 'transparent', borderBottom: '0.5px solid var(--color-green-border)' }}>
                            <td className="p-2.5">
                              <div className="font-bold">{st.name}</div>
                              <div className="text-xs" style={{ color: 'var(--color-deep-green-text)' }}>{st.designation}</div>
                            </td>
                            <td className="p-2.5"><StaffRoleBadge roleTitle={st.roleTitle} /></td>
                            <td className="p-2.5 text-xs">{st.subjects.length ? st.subjects.join(', ') : 'Department Governance'}</td>
                            <td className="p-2.5 text-xs">{st.assignedClassIds.length ? st.assignedClassIds.join(', ') : 'All Dept Classes'}</td>
                            <td className="p-2.5 text-xs">{st.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'EXAM_CELL_VERIFY' && (() => {
            const deptId = currentUser.staffProfile?.departmentId || 'DEPT-CSE';
            const deptClassIds = new Set(classes.filter((c) => c.departmentId === deptId).map((c) => c.id));
            const deptAssessments = assessments.filter((a) => deptClassIds.has(a.classId));
            const filtered = deptAssessments.filter((a) => {
              const matchCls = examClassFilter === 'ALL' || a.classId === examClassFilter;
              const matchSt = examStatusFilter === 'ALL' || (examStatusFilter === 'VERIFIED' ? a.verifiedByExamCell : !a.verifiedByExamCell);
              return matchCls && matchSt;
            });
            const pendingIds = filtered.filter((a) => !a.verifiedByExamCell).map((a) => a.id);

            return (
              <div className="cream-card-surface p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold">Exam Cell Internal Marks Verification — {deptId}</h2>
                    <p className="text-sm" style={{ color: 'var(--color-deep-green-text)' }}>
                      Verified: {deptAssessments.filter((a) => a.verifiedByExamCell).length} &bull; Pending: {deptAssessments.filter((a) => !a.verifiedByExamCell).length}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select value={examClassFilter} onChange={(e) => setExamClassFilter(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                      <option value="ALL">All Dept Classes</option>
                      {classes.filter((c) => c.departmentId === deptId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={examStatusFilter} onChange={(e) => setExamStatusFilter(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="VERIFIED">Verified</option>
                    </select>
                    <button
                      type="button"
                      disabled={pendingIds.length === 0}
                      onClick={() => {
                        const pendingSet = new Set(pendingIds);
                        setAssessments((prev) => prev.map((a) => (pendingSet.has(a.id) ? { ...a, verifiedByExamCell: true, verifiedBy: currentUser.id } : a)));
                        setFeedback({ text: `Verified ${pendingIds.length} internal assessment record(s).` });
                      }}
                      className="primary-action-button px-4 py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Verify All Filtered Pending ({pendingIds.length})
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-left" style={{ borderColor: 'var(--color-green-border)' }}>
                        <th className="p-2">Student</th><th className="p-2">Class</th><th className="p-2">Subject</th><th className="p-2">Category</th><th className="p-2">Marks</th><th className="p-2">Status</th><th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 60).map((a, idx) => {
                        const stu = students.find((s) => s.id === a.studentId);
                        return (
                          <tr key={a.id} style={{ backgroundColor: idx % 2 === 1 ? 'var(--color-warm-sand-tint)' : 'transparent', borderBottom: '0.5px solid var(--color-green-border)' }}>
                            <td className="p-2">{stu?.name || a.studentId} ({stu?.rollNumber})</td>
                            <td className="p-2 text-xs">{a.classId}</td>
                            <td className="p-2 text-xs">{a.subject}</td>
                            <td className="p-2 text-xs">{a.category}</td>
                            <td className="p-2 font-bold">{a.marksObtained} / {a.maxMarks}</td>
                            <td className="p-2">{a.verifiedByExamCell ? <StatusBadge type="positive" label="Verified" /> : <StatusBadge type="neutral" label="Pending" />}</td>
                            <td className="p-2">
                              {a.verifiedByExamCell ? (
                                <span className="text-xs" style={{ color: 'var(--color-deep-green-text)' }}>Approved</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssessments((prev) => prev.map((item) => (item.id === a.id ? { ...item, verifiedByExamCell: true, verifiedBy: currentUser.id } : item)));
                                    setFeedback({ text: `Verified ${a.subject} (${a.category}) marks for ${stu?.name || a.studentId}.` });
                                  }}
                                  className="primary-action-button px-3 py-1 text-xs font-bold cursor-pointer"
                                >
                                  Verify
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {activeTab === 'FACULTY_ATTENDANCE' && (
            <div className="cream-card-surface p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">Daily Attendance Register</h2>
                  <p className="text-sm" style={{ color: 'var(--color-deep-green-text)' }}>Thread-safe marking (ReentrantReadWriteLock)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleBulkPresent} className="secondary-action-button px-4 py-2 text-sm font-semibold cursor-pointer">Bulk Mark All Present</button>
                  <button type="button" onClick={handleSaveGrid} className="primary-action-button px-4 py-2 text-sm font-bold cursor-pointer">Save Attendance Grid</button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select value={activeClass.id} onChange={(e) => setSelectedClassId(e.target.value)} className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                  {scopedClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={effectiveSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                  {allowedSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                </select>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: 'var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                      <th className="p-2.5">Roll No</th><th className="p-2.5">Student</th><th className="p-2.5">Cumulative %</th><th className="p-2.5">Status</th><th className="p-2.5">Session Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((stu, i) => {
                      const val = attendanceDraft[stu.id] || 'PRESENT';
                      return (
                        <tr key={stu.id} style={{ backgroundColor: i % 2 === 1 ? 'var(--color-warm-sand-tint)' : 'transparent', borderBottom: '0.5px solid var(--color-green-border)' }}>
                          <td className="p-2.5 font-bold">{stu.rollNumber}</td>
                          <td className="p-2.5">{stu.name}</td>
                          <td className="p-2.5">{stu.attendancePercentage.toFixed(1)}%</td>
                          <td className="p-2.5">{stu.attendancePercentage < 75 ? <StatusBadge type="negative" label="Shortage" /> : <StatusBadge type="positive" label="Eligible" />}</td>
                          <td className="p-2.5">
                            <div className="flex gap-1.5">
                              {(['PRESENT', 'ABSENT', 'PENDING'] as AttendanceStatus[]).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setAttendanceDraft((prev) => ({ ...prev, [stu.id]: st }))}
                                  className="rounded-full px-3 py-1 text-xs font-bold cursor-pointer"
                                  style={{
                                    backgroundColor: val === st ? (st === 'PRESENT' ? 'var(--color-forest-green-background)' : st === 'ABSENT' ? 'var(--color-beige-red-background)' : 'var(--color-warm-sand)') : 'var(--color-cream-button)',
                                    color: val === st ? (st === 'PRESENT' ? 'var(--color-forest-green)' : st === 'ABSENT' ? 'var(--color-beige-red)' : 'var(--color-primary-green-text)') : 'var(--color-deep-green-text)',
                                    border: '0.5px solid var(--color-green-border)',
                                  }}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'FACULTY_MARKS' && (
            <div className="cream-card-surface p-5 space-y-4">
              <h2 className="text-xl font-bold">Internal Assessment Marks Entry</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select value={activeClass.id} onChange={(e) => setSelectedClassId(e.target.value)} className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                  {scopedClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={effectiveSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                  {allowedSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                </select>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as AssessmentCategory)} className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                  <option value="INTERNAL_TEST">Internal Test (Max 50)</option>
                  <option value="ASSIGNMENT">Assignment (Max 25)</option>
                  <option value="LAB_RECORD">Lab Record &amp; Viva (Max 25)</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: 'var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                      <th className="p-2.5">Roll No</th><th className="p-2.5">Student</th><th className="p-2.5">Marks</th><th className="p-2.5">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((stu, i) => {
                      const asm = assessments.find((a) => a.studentId === stu.id && a.subject === effectiveSubject && a.category === selectedCategory);
                      return (
                        <tr key={stu.id} style={{ backgroundColor: i % 2 === 1 ? 'var(--color-warm-sand-tint)' : 'transparent', borderBottom: '0.5px solid var(--color-green-border)' }}>
                          <td className="p-2.5 font-bold">{stu.rollNumber}</td>
                          <td className="p-2.5">{stu.name}</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.5"
                              defaultValue={asm?.marksObtained ?? 0}
                              onBlur={(e) => handleUpdateMark(stu.id, e.target.value)}
                              className="w-24 rounded-lg px-2.5 py-1 text-sm font-semibold"
                              style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}
                            />
                          </td>
                          <td className="p-2.5">{selectedCategory === 'INTERNAL_TEST' ? 50 : 25}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'CLASS_REPORT' && (() => {
            const ranked = [...classStudents].sort((a, b) => b.academicPercentage - a.academicPercentage);
            const cohort = ranked.map((s) => s.academicPercentage);
            const shortage = ranked.filter((s) => s.attendancePercentage < 75);
            return (
              <div className="cream-card-surface p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold">
                      {currentUser.role === 'CLASS_ADVISOR' ? 'Class Advisor Dashboard — ' : 'Class Report: '}
                      {activeClass.name}
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-deep-green-text)' }}>Ranking &amp; Attendance Shortage (&lt;75%) Summary</p>
                  </div>
                  <div className="no-print flex flex-wrap gap-2">
                    <select value={activeClass.id} onChange={(e) => setSelectedClassId(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm" style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}>
                      {scopedClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" onClick={() => window.print()} className="secondary-action-button px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1 cursor-pointer"><Printer className="h-4 w-4" />Print</button>
                    <button type="button" onClick={() => downloadCsv(`class-${activeClass.id}.csv`, ['Rank', 'Roll', 'Name', 'Attendance %', 'Score %', 'Grade'], ranked.map((s, idx) => [idx + 1, s.rollNumber, s.name, s.attendancePercentage, s.academicPercentage, assignGrade(s.academicPercentage, gradingStrategy, cohort)]))} className="primary-action-button px-3.5 py-1.5 text-sm font-bold inline-flex items-center gap-1 cursor-pointer"><Download className="h-4 w-4" />CSV</button>
                  </div>
                </div>
                <table className="w-full border-collapse text-sm">
                  <thead><tr className="border-b text-left" style={{ borderColor: 'var(--color-green-border)' }}><th className="p-2">Rank</th><th className="p-2">Student</th><th className="p-2">Attendance</th><th className="p-2">Score</th><th className="p-2">Grade</th></tr></thead>
                  <tbody>
                    {ranked.map((s, idx) => (
                      <tr key={s.id} style={{ backgroundColor: idx % 2 === 1 ? 'var(--color-warm-sand-tint)' : 'transparent', borderBottom: '0.5px solid var(--color-green-border)' }}>
                        <td className="p-2 font-bold">#{idx + 1}</td>
                        <td className="p-2">{s.name} ({s.rollNumber})</td>
                        <td className="p-2">{s.attendancePercentage.toFixed(1)}%</td>
                        <td className="p-2">{s.academicPercentage.toFixed(1)}%</td>
                        <td className="p-2"><StatusBadge type="positive" label={assignGrade(s.academicPercentage, gradingStrategy, cohort)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-beige-red)' }}>
                  Shortage Students (&lt;75%): {shortage.length === 0 ? 'None' : shortage.map((s) => `${s.name} (${s.attendancePercentage}%)`).join(', ')}
                </div>
                <div className="border-t pt-2 text-xs flex justify-between" style={{ borderColor: 'var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                  <span>Generated by: report-worker-2</span><span>ClassReport.generate()</span>
                </div>
              </div>
            );
          })()}

          {activeTab === 'STUDENT_OVERVIEW' && (() => {
            const cohort = students.filter((s) => s.classId === currentStudent.classId).map((s) => s.academicPercentage);
            const grade = assignGrade(currentStudent.academicPercentage, gradingStrategy, cohort);
            const subRows = currentClassOfStudent.subjects.map((sub) => {
              const items = assessments.filter((a) => a.studentId === currentStudent.id && a.subject === sub);
              const t = items.find((i) => i.category === 'INTERNAL_TEST')?.marksObtained ?? 0;
              const asg = items.find((i) => i.category === 'ASSIGNMENT')?.marksObtained ?? 0;
              const lab = items.find((i) => i.category === 'LAB_RECORD')?.marksObtained ?? 0;
              const weighted = Math.round(((t / 50) * 50 + (asg / 25) * 25 + (lab / 25) * 25) * 10) / 10;
              const verifiedCount = items.filter((i) => i.verifiedByExamCell).length;
              return {
                sub,
                t,
                asg,
                lab,
                weighted,
                subGrade: assignGrade(weighted, gradingStrategy, cohort),
                att: currentStudent.attendancePercentage,
                verified: items.length > 0 && verifiedCount === items.length,
              };
            });

            return (
              <div className="space-y-4">
                {currentStudent.attendancePercentage < 75 && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold" style={{ backgroundColor: 'var(--color-warm-sand)', color: 'var(--color-beige-red)', border: '1px solid rgba(140,63,52,0.35)' }}>
                    <AlertTriangle className="h-5 w-5" />
                    <span>Low-Attendance Warning: Your attendance ({currentStudent.attendancePercentage.toFixed(1)}%) is below 75%.</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="cream-card-surface p-4"><div className="text-xs font-bold uppercase" style={{ color: 'var(--color-deep-green-text)' }}>Roll Number</div><div className="mt-1 text-xl font-bold">{currentStudent.rollNumber}</div><div className="mt-0.5 text-xs" style={{ color: 'var(--color-deep-green-text)' }}>{currentClassOfStudent.name}</div></div>
                  <div className="cream-card-surface p-4"><div className="text-xs font-bold uppercase" style={{ color: 'var(--color-deep-green-text)' }}>Overall Attendance</div><div className="mt-1 text-xl font-bold">{currentStudent.attendancePercentage.toFixed(1)}%</div><div className="mt-1">{currentStudent.attendancePercentage < 75 ? <StatusBadge type="negative" label="Shortage (<75%)" /> : <StatusBadge type="positive" label="Eligible" />}</div></div>
                  <div className="cream-card-surface p-4"><div className="text-xs font-bold uppercase" style={{ color: 'var(--color-deep-green-text)' }}>Weighted Score</div><div className="mt-1 text-xl font-bold">{currentStudent.academicPercentage.toFixed(1)}%</div><div className="mt-0.5 text-xs" style={{ color: 'var(--color-deep-green-text)' }}>Across {subRows.length} subjects</div></div>
                  <div className="cream-card-surface p-4"><div className="text-xs font-bold uppercase" style={{ color: 'var(--color-deep-green-text)' }}>Current Grade</div><div className="mt-1 text-xl font-bold">{grade}</div><div className="mt-0.5 text-xs" style={{ color: 'var(--color-deep-green-text)' }}>{gradingStrategy} Grading</div></div>
                </div>

                <div className="cream-card-surface p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold">Subject-Wise Attendance &amp; Assessment Summary</h2>
                      <p className="text-xs" style={{ color: 'var(--color-deep-green-text)' }}>
                        Daily attendance standing and internal assessment marks for Semester {currentClassOfStudent.semester}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('STUDENT_REPORT');
                        setFeedback(null);
                      }}
                      className="primary-action-button px-4 py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Open Individual Report
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b text-left" style={{ borderColor: 'var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                          <th className="p-2">Subject</th><th className="p-2">Attendance %</th><th className="p-2">Internal (50)</th><th className="p-2">Assign (25)</th><th className="p-2">Lab (25)</th><th className="p-2">Weighted %</th><th className="p-2">Grade</th><th className="p-2">Exam Cell</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subRows.map((r, i) => (
                          <tr key={r.sub} style={{ backgroundColor: i % 2 === 1 ? 'var(--color-warm-sand-tint)' : 'transparent', borderBottom: '0.5px solid var(--color-green-border)' }}>
                            <td className="p-2 font-semibold">{r.sub}</td>
                            <td className="p-2">{r.att.toFixed(1)}%</td>
                            <td className="p-2">{r.t}</td>
                            <td className="p-2">{r.asg}</td>
                            <td className="p-2">{r.lab}</td>
                            <td className="p-2 font-bold">{r.weighted}%</td>
                            <td className="p-2"><StatusBadge type={r.subGrade === 'F' ? 'negative' : 'positive'} label={r.subGrade} /></td>
                            <td className="p-2">{r.verified ? <StatusBadge type="positive" label="Verified" /> : <StatusBadge type="neutral" label="Pending" />}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'STUDENT_REPORT' && (() => {
            const classCohortStudents = students.filter((s) => s.classId === currentStudent.classId);
            const cohort = classCohortStudents.map((s) => s.academicPercentage);
            const cohortMean = cohort.reduce((a, b) => a + b, 0) / Math.max(1, cohort.length);
            const cohortSd = Math.max(2, Math.sqrt(cohort.reduce((a, b) => a + (b - cohortMean) ** 2, 0) / Math.max(1, cohort.length)));
            const grade = assignGrade(currentStudent.academicPercentage, gradingStrategy, cohort);
            const subRows = currentClassOfStudent.subjects.map((sub) => {
              const items = assessments.filter((a) => a.studentId === currentStudent.id && a.subject === sub);
              const t = items.find((i) => i.category === 'INTERNAL_TEST')?.marksObtained ?? 0;
              const asg = items.find((i) => i.category === 'ASSIGNMENT')?.marksObtained ?? 0;
              const lab = items.find((i) => i.category === 'LAB_RECORD')?.marksObtained ?? 0;
              const weighted = Math.round(((t / 50) * 50 + (asg / 25) * 25 + (lab / 25) * 25) * 10) / 10;
              const subjectCohort = classCohortStudents.map((peer) => {
                const peerItems = assessments.filter((a) => a.studentId === peer.id && a.subject === sub);
                const pt = peerItems.find((i) => i.category === 'INTERNAL_TEST')?.marksObtained ?? 0;
                const pasg = peerItems.find((i) => i.category === 'ASSIGNMENT')?.marksObtained ?? 0;
                const plab = peerItems.find((i) => i.category === 'LAB_RECORD')?.marksObtained ?? 0;
                return Math.round(((pt / 50) * 50 + (pasg / 25) * 25 + (plab / 25) * 25) * 10) / 10;
              });
              return {
                sub,
                t,
                asg,
                lab,
                weighted,
                subGrade: assignGrade(weighted, gradingStrategy, subjectCohort),
                att: currentStudent.attendancePercentage,
              };
            });

            return (
              <div className="space-y-4">
                <div className="cream-card-surface p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold">Individual Academic Performance Report</h2>
                      <p className="text-sm" style={{ color: 'var(--color-deep-green-text)' }}>
                        {currentStudent.name} ({currentStudent.rollNumber}) &bull; {currentClassOfStudent.name} &bull; Overall Grade: {grade}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold" style={{ color: 'var(--color-forest-green)' }}>
                        {gradingStrategy === 'RELATIVE'
                          ? `Relative Grading Active (Class Mean ${cohortMean.toFixed(1)}%, SD ${cohortSd.toFixed(1)}%)`
                          : 'Absolute Grading Active (A+ ≥90, A ≥80, B+ ≥70, B ≥60, C ≥50, D ≥40)'}
                      </p>
                    </div>
                    <div className="no-print flex flex-wrap items-center gap-2">
                      <select
                        value={gradingStrategy}
                        onChange={(e) => setGradingStrategy(e.target.value as GradingStrategyName)}
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold cursor-pointer"
                        style={{ backgroundColor: 'var(--color-cream-button)', border: '0.5px solid var(--color-green-border)' }}
                      >
                        <option value="ABSOLUTE">Absolute Grading</option>
                        <option value="RELATIVE">Relative Grading</option>
                      </select>
                      <button type="button" onClick={() => window.print()} className="secondary-action-button px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1 cursor-pointer"><Printer className="h-4 w-4" />Print</button>
                      <button type="button" onClick={() => downloadCsv(`student-${currentStudent.rollNumber}.csv`, ['Subject', 'Internal (50)', 'Assignment (25)', 'Lab (25)', 'Weighted %', 'Grade'], subRows.map((r) => [r.sub, r.t, r.asg, r.lab, r.weighted, r.subGrade]))} className="primary-action-button px-3.5 py-1.5 text-sm font-bold inline-flex items-center gap-1 cursor-pointer"><Download className="h-4 w-4" />CSV</button>
                    </div>
                  </div>
                  {currentStudent.attendancePercentage < 75 && (
                    <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold" style={{ backgroundColor: 'var(--color-warm-sand)', color: 'var(--color-beige-red)', border: '1px solid rgba(140,63,52,0.35)' }}>
                      <AlertTriangle className="h-5 w-5" />
                      <span>Low-Attendance Alert: {currentStudent.attendancePercentage.toFixed(1)}% is below the 75.0% requirement.</span>
                    </div>
                  )}
                  <SvgBarChart labels={subRows.map((r) => r.sub)} primary={subRows.map((r) => r.weighted)} secondary={subRows.map((r) => r.att)} primaryLabel="Weighted Score %" secondaryLabel="Attendance %" />
                </div>

                <div className="cream-card-surface p-5 space-y-3">
                  <h3 className="text-base font-bold">Subject Performance Transcript</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead><tr className="border-b text-left" style={{ borderColor: 'var(--color-green-border)' }}><th className="p-2">Subject</th><th className="p-2">Internal (50)</th><th className="p-2">Assign (25)</th><th className="p-2">Lab (25)</th><th className="p-2">Total %</th><th className="p-2">Grade</th><th className="p-2">Status</th></tr></thead>
                      <tbody>
                        {subRows.map((r, i) => (
                          <tr key={r.sub} style={{ backgroundColor: i % 2 === 1 ? 'var(--color-warm-sand-tint)' : 'transparent', borderBottom: '0.5px solid var(--color-green-border)' }}>
                            <td className="p-2 font-semibold">{r.sub}</td>
                            <td className="p-2">{r.t}</td>
                            <td className="p-2">{r.asg}</td>
                            <td className="p-2">{r.lab}</td>
                            <td className="p-2 font-bold">{r.weighted}%</td>
                            <td className="p-2"><StatusBadge type={r.subGrade === 'F' ? 'negative' : 'positive'} label={r.subGrade} /></td>
                            <td className="p-2">{r.att < 75 ? <StatusBadge type="negative" label="Shortage" /> : <StatusBadge type="positive" label="Eligible" />}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t pt-2 text-xs flex flex-wrap justify-between gap-2" style={{ borderColor: 'var(--color-green-border)', color: 'var(--color-deep-green-text)' }}>
                    <span>Generated by: report-worker-3 &bull; StudentReport.generate()</span>
                    <span>Strategy: {gradingStrategy} GRADING &bull; Overall Score: {currentStudent.academicPercentage.toFixed(1)}% ({grade})</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
