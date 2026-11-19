"use strict";

/** @typedef {{ id: string, name: string, email: string, role: string, roleTitle?: string, permissions?: string[], dashboardSummary: string, profile: any }} UserSession */

const applicationState = {
    /** @type {UserSession | null} */
    currentUser: null,
    activeSection: "",
    departments: /** @type {any[]} */ ([]),
    classes: /** @type {any[]} */ ([]),
    students: /** @type {any[]} */ ([]),
    faculty: /** @type {any[]} */ ([]),
    overview: /** @type {any} */ ({}),
    studentSearchQuery: "",
    studentDepartmentFilter: "ALL",
    studentClassFilter: "ALL",
    studentShortageFilter: "ALL",
    studentSortField: "rollNumber",
    studentSortAscending: true,
    editingDepartmentId: null,
    editingClassId: null,
    editingStudentId: null,
    editingFacultyId: null,
    facultySelectedClassId: "",
    facultySelectedSubject: "",
    facultySelectedDate: new Date().toISOString().slice(0, 10),
    facultyAttendanceDraft: /** @type {Record<string, string>} */ ({}),
    facultyAssessmentCategory: "INTERNAL_TEST",
    selectedDepartmentReportId: "",
    departmentStaffList: /** @type {any[]} */ ([]),
    staffSearchQuery: "",
    staffRoleFilter: "ALL",
    examCellClassFilter: "ALL",
    examCellSubjectFilter: "ALL",
    examCellStatusFilter: "ALL",
    examCellAssessments: /** @type {any[]} */ ([]),
    activeReport: /** @type {any | null} */ (null),
    parallelBatchResult: /** @type {any | null} */ (null)
};

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function renderStatusBadge(statusType, labelText) {
    const normalized = String(statusType || "").toUpperCase();
    if (normalized === "PRESENT" || normalized === "ELIGIBLE" || normalized === "APPROVED" || normalized === "PASS" || normalized === "VERIFIED") {
        return `<span class="status-badge-positive">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ${escapeHtml(labelText)}
        </span>`;
    }
    if (normalized === "ABSENT" || normalized === "SHORTAGE" || normalized === "REJECTED" || normalized === "FAIL") {
        return `<span class="status-badge-negative">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ${escapeHtml(labelText)}
        </span>`;
    }
    return `<span class="status-badge-neutral">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${escapeHtml(labelText)}
    </span>`;
}

function renderStaffRoleBadge(roleTitle) {
    const title = String(roleTitle || "Subject Faculty");
    const isLeadershipSage =
        title === "Dean" ||
        title === "Head of Department" ||
        title === "Academic Coordinator" ||
        title === "Exam Cell Coordinator";

    const badgeClass = isLeadershipSage ? "staff-role-badge-sage" : "staff-role-badge-beige";
    let iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
    if (title === "Dean" || title === "Head of Department") {
        iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    } else if (title === "Exam Cell Coordinator") {
        iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;
    } else if (title === "Academic Coordinator" || title === "Class Advisor") {
        iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    } else if (title === "Lab Instructor") {
        iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/></svg>`;
    }
    return `<span class="${badgeClass}">${iconSvg}<span>${escapeHtml(title)}</span></span>`;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
}

function showGlobalFeedback(message, type = "positive") {
    const banner = document.getElementById("globalFeedbackBanner");
    if (!banner) return;
    banner.className = `inline-feedback-banner ${type === "negative" ? "negative-feedback-banner" : "positive-feedback-banner"} no-print`;
    const icon = type === "negative"
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>`;
    banner.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    banner.classList.remove("hidden-element");
}

function clearGlobalFeedback() {
    const banner = document.getElementById("globalFeedbackBanner");
    if (banner) {
        banner.classList.add("hidden-element");
        banner.innerHTML = "";
    }
}

function downloadCsvFile(filename, headers, rows) {
    const csvLines = [headers.join(",")];
    for (const row of rows) {
        const line = row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",");
        csvLines.push(line);
    }
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function buildInlineSvgBarChart(labels, primaryValues, secondaryValues, primaryLabel, secondaryLabel) {
    if (!labels || labels.length === 0) {
        return `<p class="secondary-subtitle">No chart data available.</p>`;
    }
    const width = Math.max(540, labels.length * 120);
    const height = 240;
    const padLeft = 46;
    const padBottom = 46;
    const padTop = 28;
    const chartHeight = height - padBottom - padTop;
    const groupWidth = (width - padLeft - 20) / labels.length;

    let maxPrimaryIndex = 0;
    primaryValues.forEach((v, idx) => {
        if (v > primaryValues[maxPrimaryIndex]) maxPrimaryIndex = idx;
    });

    const gridLines = [0, 25, 50, 75, 100].map(val => {
        const y = padTop + chartHeight - (val / 100) * chartHeight;
        return `<line x1="${padLeft}" y1="${y}" x2="${width - 10}" y2="${y}" stroke="rgba(63, 90, 51, 0.18)" stroke-dasharray="3,3" />
                <text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#3F5A33">${val}%</text>`;
    }).join("");

    const bars = labels.map((label, idx) => {
        const xCenter = padLeft + idx * groupWidth + groupWidth / 2;
        const val1 = Math.min(100, Math.max(0, Number(primaryValues[idx] || 0)));
        const h1 = (val1 / 100) * chartHeight;
        const y1 = padTop + chartHeight - h1;
        const barColor1 = idx === maxPrimaryIndex ? "#D5851F" : "#87A96B";

        let secondBarSvg = "";
        if (secondaryValues && secondaryValues.length > idx) {
            const val2 = Math.min(100, Math.max(0, Number(secondaryValues[idx] || 0)));
            const h2 = (val2 / 100) * chartHeight;
            const y2 = padTop + chartHeight - h2;
            secondBarSvg = `
                <rect x="${xCenter + 2}" y="${y2}" width="22" height="${h2}" rx="4" fill="#B5C093" stroke="#3F5A33" stroke-width="0.5"/>
                <text x="${xCenter + 13}" y="${y2 - 5}" text-anchor="middle" font-size="10" font-weight="700" fill="#1F2A14">${val2.toFixed(0)}%</text>
            `;
        }

        const firstX = secondaryValues ? xCenter - 24 : xCenter - 15;
        const firstWidth = secondaryValues ? 22 : 30;
        const shortLabel = label.length > 16 ? label.slice(0, 14) + "…" : label;

        return `
            <rect x="${firstX}" y="${y1}" width="${firstWidth}" height="${h1}" rx="4" fill="${barColor1}" stroke="#1F2A14" stroke-width="0.4"/>
            <text x="${firstX + firstWidth / 2}" y="${y1 - 5}" text-anchor="middle" font-size="10" font-weight="700" fill="#1F2A14">${val1.toFixed(0)}%</text>
            ${secondBarSvg}
            <text x="${xCenter}" y="${height - 16}" text-anchor="middle" font-size="11" font-weight="600" fill="#1F2A14">${escapeHtml(shortLabel)}</text>
        `;
    }).join("");

    const legend = `
        <div class="action-toolbar" style="margin-top:8px;font-size:0.8rem;color:#3F5A33;">
            <span><svg width="12" height="12"><rect width="12" height="12" rx="2" fill="#87A96B"/></svg> ${escapeHtml(primaryLabel)}</span>
            ${secondaryLabel ? `<span><svg width="12" height="12"><rect width="12" height="12" rx="2" fill="#B5C093"/></svg> ${escapeHtml(secondaryLabel)}</span>` : ""}
            <span><svg width="12" height="12"><rect width="12" height="12" rx="2" fill="#D5851F"/></svg> Peak Highlight</span>
        </div>
    `;

    return `<div class="chart-container">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Performance Bar Chart">
            ${gridLines}
            <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + chartHeight}" stroke="#3F5A33" stroke-width="1"/>
            <line x1="${padLeft}" y1="${padTop + chartHeight}" x2="${width - 10}" y2="${padTop + chartHeight}" stroke="#3F5A33" stroke-width="1"/>
            ${bars}
        </svg>
        ${legend}
    </div>`;
}

function buildInlineSvgTrendChart(trendRows) {
    if (!trendRows || trendRows.length === 0) {
        return `<p class="secondary-subtitle">No assessment trend data available.</p>`;
    }
    const width = Math.max(540, trendRows.length * 72);
    const height = 220;
    const padLeft = 46;
    const padTop = 26;
    const padBottom = 42;
    const chartWidth = width - padLeft - 30;
    const chartHeight = height - padTop - padBottom;

    const points = trendRows.map((row, idx) => {
        const x = trendRows.length === 1
            ? padLeft + chartWidth / 2
            : padLeft + (idx / (trendRows.length - 1)) * chartWidth;
        const pct = Math.min(100, Math.max(0, Number(row.percentageScore || 0)));
        const y = padTop + chartHeight - (pct / 100) * chartHeight;
        return { x, y, pct, label: `${row.subject.slice(0, 6)} (${row.category.slice(0, 3)})` };
    });

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");
    const grid = [0, 25, 50, 75, 100].map(val => {
        const y = padTop + chartHeight - (val / 100) * chartHeight;
        return `<line x1="${padLeft}" y1="${y}" x2="${width - 16}" y2="${y}" stroke="rgba(63,90,51,0.18)" stroke-dasharray="3,3"/>
                <text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#3F5A33">${val}%</text>`;
    }).join("");

    const dots = points.map((p, idx) => {
        const fill = idx === points.length - 1 ? "#D5851F" : "#3F6B2E";
        return `
            <circle cx="${p.x}" cy="${p.y}" r="5" fill="${fill}" stroke="#F6F0E4" stroke-width="1.5"/>
            <text x="${p.x}" y="${p.y - 9}" text-anchor="middle" font-size="10" font-weight="700" fill="#1F2A14">${p.pct.toFixed(0)}%</text>
            <text x="${p.x}" y="${height - 14}" text-anchor="middle" font-size="10" fill="#3F5A33">${escapeHtml(p.label)}</text>
        `;
    }).join("");

    return `<div class="chart-container">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Assessment Score Trend Chart">
            ${grid}
            <polyline fill="none" stroke="#6F8E54" stroke-width="2.5" points="${polylinePoints}"/>
            ${dots}
        </svg>
    </div>`;
}

// Login Initialization
function initializeLoginHandlers() {
    const roleButtons = document.querySelectorAll(".role-option-button");
    const hiddenRoleInput = /** @type {HTMLInputElement} */ (document.getElementById("selectedRoleInput"));
    const emailInput = /** @type {HTMLInputElement} */ (document.getElementById("loginEmailInput"));
    const passwordInput = /** @type {HTMLInputElement} */ (document.getElementById("loginPasswordInput"));
    const loginErrorBanner = document.getElementById("loginErrorBanner");

    roleButtons.forEach(button => {
        button.addEventListener("click", () => {
            roleButtons.forEach(b => b.classList.remove("active-role-option"));
            button.classList.add("active-role-option");
            hiddenRoleInput.value = button.getAttribute("data-role") || "ADMIN";
        });
    });

    document.querySelectorAll(".demo-fill-button").forEach(button => {
        button.addEventListener("click", () => {
            const role = button.getAttribute("data-demo-role") || "ADMIN";
            const email = button.getAttribute("data-demo-email") || "";
            const password = button.getAttribute("data-demo-password") || "";
            hiddenRoleInput.value = role;
            roleButtons.forEach(b => {
                b.classList.toggle("active-role-option", b.getAttribute("data-role") === role);
            });
            emailInput.value = email;
            passwordInput.value = password;
            if (loginErrorBanner) loginErrorBanner.classList.add("hidden-element");
        });
    });

    const loginForm = document.getElementById("loginForm");
    loginForm?.addEventListener("submit", async event => {
        event.preventDefault();
        if (loginErrorBanner) loginErrorBanner.classList.add("hidden-element");

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const role = hiddenRoleInput.value;

        if (!email || !password) {
            if (loginErrorBanner) {
                loginErrorBanner.textContent = "Please enter both your institutional email and password.";
                loginErrorBanner.classList.remove("hidden-element");
            }
            return;
        }

        try {
            const session = await apiRequest("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password, role })
            });
            applicationState.currentUser = session;
            await enterAuthenticatedWorkspace();
        } catch (err) {
            if (loginErrorBanner) {
                loginErrorBanner.textContent = err instanceof Error ? err.message : "Authentication failed.";
                loginErrorBanner.classList.remove("hidden-element");
            }
        }
    });

    document.getElementById("logoutButton")?.addEventListener("click", () => {
        applicationState.currentUser = null;
        applicationState.activeReport = null;
        applicationState.parallelBatchResult = null;
        applicationState.selectedDepartmentReportId = "";
        applicationState.staffSearchQuery = "";
        applicationState.staffRoleFilter = "ALL";
        document.getElementById("dashboardWorkspace")?.classList.add("hidden-element");
        document.getElementById("loginSection")?.classList.remove("hidden-element");
        clearGlobalFeedback();
    });
}

async function refreshSharedCatalog() {
    const [departments, classes, students, faculty, overview] = await Promise.all([
        apiRequest("/api/departments"),
        apiRequest("/api/classes"),
        apiRequest("/api/students"),
        apiRequest("/api/faculty"),
        apiRequest("/api/overview")
    ]);
    applicationState.departments = departments;
    applicationState.classes = classes;
    applicationState.students = students;
    applicationState.faculty = faculty;
    applicationState.overview = overview;
}

function getScopedDepartmentsForUser() {
    const user = applicationState.currentUser;
    if (!user) return applicationState.departments;
    if (user.role === "DEAN") {
        const overseen = user.profile?.overseenDepartmentIds || [];
        const matches = applicationState.departments.filter(d => overseen.includes(d.id));
        return matches.length > 0 ? matches : applicationState.departments;
    }
    if (user.role === "HOD" || user.role === "ACADEMIC_COORDINATOR" || user.role === "EXAM_CELL_COORDINATOR") {
        const deptId = user.profile?.departmentId;
        const matches = applicationState.departments.filter(d => d.id === deptId);
        return matches.length > 0 ? matches : applicationState.departments;
    }
    return applicationState.departments;
}

function getScopedClassesForUser() {
    const user = applicationState.currentUser;
    if (!user) return applicationState.classes;
    if (user.role === "FACULTY" || user.role === "CLASS_ADVISOR") {
        const assigned = user.profile?.assignedClassIds || [];
        const matches = applicationState.classes.filter(c => assigned.includes(c.id));
        return matches.length > 0 ? matches : applicationState.classes;
    }
    if (user.role === "HOD" || user.role === "ACADEMIC_COORDINATOR" || user.role === "EXAM_CELL_COORDINATOR") {
        const deptId = user.profile?.departmentId;
        const matches = applicationState.classes.filter(c => c.departmentId === deptId);
        return matches.length > 0 ? matches : applicationState.classes;
    }
    if (user.role === "DEAN") {
        const overseen = user.profile?.overseenDepartmentIds || [];
        const matches = applicationState.classes.filter(c => overseen.includes(c.departmentId));
        return matches.length > 0 ? matches : applicationState.classes;
    }
    return applicationState.classes;
}

async function enterAuthenticatedWorkspace() {
    const user = applicationState.currentUser;
    if (!user) return;

    await refreshSharedCatalog();

    document.getElementById("loginSection")?.classList.add("hidden-element");
    document.getElementById("dashboardWorkspace")?.classList.remove("hidden-element");

    const roleBadge = document.getElementById("activeRoleBadge");
    if (roleBadge) roleBadge.textContent = user.roleTitle || user.role;

    const userDisplay = document.getElementById("signedInUserDisplay");
    if (userDisplay) userDisplay.textContent = `${user.name} (${user.email})`;

    const sidebarName = document.getElementById("sidebarUserName");
    if (sidebarName) sidebarName.textContent = user.name;

    const sidebarSummary = document.getElementById("sidebarDashboardSummary");
    if (sidebarSummary) sidebarSummary.textContent = user.dashboardSummary;

    const scopedDepts = getScopedDepartmentsForUser();
    applicationState.selectedDepartmentReportId = scopedDepts[0]?.id || "DEPT-CSE";
    applicationState.staffSearchQuery = "";
    applicationState.staffRoleFilter = "ALL";
    applicationState.examCellClassFilter = "ALL";
    applicationState.examCellSubjectFilter = "ALL";
    applicationState.examCellStatusFilter = "ALL";

    if (user.role === "ADMIN") {
        applicationState.activeSection = "ADMIN_OVERVIEW";
    } else if (user.role === "DEAN") {
        applicationState.activeSection = "DEAN_OVERVIEW";
    } else if (user.role === "HOD" || user.role === "ACADEMIC_COORDINATOR") {
        const deptClasses = getScopedClassesForUser();
        applicationState.facultySelectedClassId = deptClasses[0]?.id ?? "";
        applicationState.activeSection = "DEPARTMENT_REPORT";
    } else if (user.role === "CLASS_ADVISOR") {
        const advised = getScopedClassesForUser();
        applicationState.facultySelectedClassId = advised[0]?.id ?? "";
        applicationState.activeSection = "CLASS_ADVISOR_DASHBOARD";
    } else if (user.role === "EXAM_CELL_COORDINATOR") {
        applicationState.activeSection = "EXAM_CELL_VERIFICATION";
    } else if (user.role === "FACULTY") {
        const assigned = getScopedClassesForUser();
        applicationState.facultySelectedClassId = assigned[0]?.id ?? "";
        const facultySubjects = getAllowedSubjectsForClass(assigned[0]);
        applicationState.facultySelectedSubject = facultySubjects[0] || "";
        applicationState.activeSection = "FACULTY_ATTENDANCE";
    } else {
        applicationState.activeSection = "STUDENT_OVERVIEW";
    }

    renderSidebarNavigation();
    await renderActiveSection();
}

function getMenuItemsForRole(role) {
    switch (role) {
        case "ADMIN":
            return [
                { id: "ADMIN_OVERVIEW", label: "Overview & Parallel Reports" },
                { id: "ADMIN_DEPARTMENTS", label: "Manage Departments" },
                { id: "ADMIN_CLASSES", label: "Manage Classes" },
                { id: "ADMIN_STUDENTS", label: "Manage Students" },
                { id: "ADMIN_FACULTY", label: "Manage Faculty" },
                { id: "DEPARTMENT_REPORT", label: "Department Report & Staff" }
            ];
        case "DEAN":
            return [
                { id: "DEAN_OVERVIEW", label: "School Overview & Departments" },
                { id: "DEPARTMENT_REPORT", label: "Department Report & Staff" },
                { id: "SCOPED_CLASS_REPORT", label: "Class-Wise Reports" }
            ];
        case "HOD":
        case "ACADEMIC_COORDINATOR":
            return [
                { id: "DEPARTMENT_REPORT", label: "Department Report & Staff" },
                { id: "SCOPED_CLASS_REPORT", label: "Class-Wise Reports" }
            ];
        case "CLASS_ADVISOR":
            return [
                { id: "CLASS_ADVISOR_DASHBOARD", label: "My Advised Class & Ranking" },
                { id: "DEPARTMENT_REPORT", label: "Department Staff Directory" }
            ];
        case "FACULTY":
            return [
                { id: "FACULTY_ATTENDANCE", label: "Mark Daily Attendance" },
                { id: "FACULTY_MARKS", label: "Internal Assessment Marks" },
                { id: "SCOPED_CLASS_REPORT", label: "Class-Wise Report" }
            ];
        case "EXAM_CELL_COORDINATOR":
            return [
                { id: "EXAM_CELL_VERIFICATION", label: "Internal Marks Verification" },
                { id: "DEPARTMENT_REPORT", label: "Department Report & Staff" }
            ];
        default:
            return [
                { id: "STUDENT_OVERVIEW", label: "My Attendance & Marks" },
                { id: "STUDENT_REPORT", label: "Individual Performance Report" }
            ];
    }
}

function renderSidebarNavigation() {
    const user = applicationState.currentUser;
    const menuContainer = document.getElementById("sidebarNavigationMenu");
    if (!user || !menuContainer) return;

    const items = getMenuItemsForRole(user.role);
    menuContainer.innerHTML = items.map(item => `
        <button type="button"
                class="sidebar-menu-button ${applicationState.activeSection === item.id ? "active-menu-item" : ""}"
                data-section="${item.id}">
            ${escapeHtml(item.label)}
        </button>
    `).join("");

    menuContainer.querySelectorAll(".sidebar-menu-button").forEach(button => {
        button.addEventListener("click", async () => {
            clearGlobalFeedback();
            applicationState.activeSection = button.getAttribute("data-section") || "";
            renderSidebarNavigation();
            await renderActiveSection();
        });
    });
}

async function renderActiveSection() {
    const container = document.getElementById("dynamicSectionContainer");
    if (!container) return;

    switch (applicationState.activeSection) {
        case "ADMIN_OVERVIEW":
            renderAdminOverviewSection(container);
            break;
        case "DEAN_OVERVIEW":
            renderDeanOverviewSection(container);
            break;
        case "ADMIN_DEPARTMENTS":
            renderAdminDepartmentsSection(container);
            break;
        case "ADMIN_CLASSES":
            renderAdminClassesSection(container);
            break;
        case "ADMIN_STUDENTS":
            renderAdminStudentsSection(container);
            break;
        case "ADMIN_FACULTY":
            renderAdminFacultySection(container);
            break;
        case "DEPARTMENT_REPORT":
            await renderDepartmentReportSection(container);
            break;
        case "CLASS_ADVISOR_DASHBOARD":
        case "SCOPED_CLASS_REPORT":
            await renderClassReportSection(container);
            break;
        case "EXAM_CELL_VERIFICATION":
            await renderExamCellVerificationSection(container);
            break;
        case "FACULTY_ATTENDANCE":
            await renderFacultyAttendanceSection(container);
            break;
        case "FACULTY_MARKS":
            await renderFacultyMarksSection(container);
            break;
        case "STUDENT_OVERVIEW":
            await renderStudentOverviewSection(container);
            break;
        case "STUDENT_REPORT":
            await renderStudentReportSection(container);
            break;
        default:
            container.innerHTML = `<div class="cream-card-surface">Select a section from the navigation menu.</div>`;
    }
}

/* ==================== DEPARTMENT CARDS HELPER ==================== */

function renderDepartmentCardsGrid(cards, titleText) {
    if (!cards || cards.length === 0) {
        return "";
    }
    return `
        <div class="cream-card-surface">
            <div class="section-header-bar" style="margin-bottom:14px;">
                <div>
                    <h3 class="card-heading" style="margin-bottom:2px;">${escapeHtml(titleText)}</h3>
                    <p class="secondary-subtitle">Click any department card to open its performance report and full staff directory.</p>
                </div>
            </div>
            <div class="department-cards-grid">
                ${cards.map(card => `
                    <div class="cream-card-surface department-overview-card" data-dept-id="${escapeHtml(card.id)}" role="button" tabindex="0">
                        <div class="section-header-bar">
                            <strong style="font-size:1.05rem;">${escapeHtml(card.code)}</strong>
                            ${renderStatusBadge(card.averageAttendance >= 75 ? "ELIGIBLE" : "SHORTAGE", `${card.averageAttendance}% Att.`)}
                        </div>
                        <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(card.name)}</div>
                        <div class="secondary-subtitle" style="font-size:0.82rem;">HOD: ${escapeHtml(card.headOfDepartment)}</div>
                        <div class="action-toolbar" style="font-size:0.8rem;color:var(--color-deep-green-text);margin-top:4px;">
                            <span><strong>${card.classCount}</strong> Classes</span>
                            <span>&bull; <strong>${card.studentCount}</strong> Students</span>
                            <span>&bull; <strong>${card.staffCount}</strong> Staff</span>
                        </div>
                        <div class="action-toolbar" style="font-size:0.8rem;justify-content:space-between;margin-top:2px;">
                            <span>Mean Score: <strong>${card.averageAcademic}%</strong></span>
                            <span>Shortage: <strong>${card.shortageCount}</strong></span>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

function attachDepartmentCardListeners(container) {
    container.querySelectorAll(".department-overview-card").forEach(cardEl => {
        const openDept = async () => {
            const deptId = cardEl.getAttribute("data-dept-id");
            if (!deptId) return;
            applicationState.selectedDepartmentReportId = deptId;
            applicationState.activeSection = "DEPARTMENT_REPORT";
            renderSidebarNavigation();
            await renderActiveSection();
        };
        cardEl.addEventListener("click", openDept);
        cardEl.addEventListener("keydown", event => {
            if (/** @type {KeyboardEvent} */ (event).key === "Enter" || /** @type {KeyboardEvent} */ (event).key === " ") {
                event.preventDefault();
                openDept();
            }
        });
    });
}

/* ==================== ADMIN & DEAN SECTIONS ==================== */

function renderAdminOverviewSection(container) {
    const ov = applicationState.overview || {};
    const batch = applicationState.parallelBatchResult;
    const deptCards = ov.departmentCards || [];

    const batchHtml = batch ? `
        <div class="cream-card-surface">
            <h3 class="card-heading">Parallel Report Execution Summary (CompletableFuture + ExecutorService)</h3>
            <p class="secondary-subtitle">
                Generated <strong>${batch.totalGenerated}</strong> reports in <strong>${batch.elapsedMilliseconds} ms</strong>
                using <strong>${escapeHtml(batch.gradingStrategy)}</strong> (Coordinator: ${escapeHtml(batch.coordinatorThread)}).
            </p>
            <div class="responsive-table-wrapper" style="margin-top:12px;">
                <table class="academic-data-table">
                    <thead>
                        <tr><th>Report Type</th><th>Title</th><th>Worker Thread</th><th>Generated At</th></tr>
                    </thead>
                    <tbody>
                        ${[...(batch.departmentReports || []), ...(batch.classReports || []), ...(batch.studentReports || []).slice(0, 6)].map(r => `
                            <tr>
                                <td>${escapeHtml(r.reportType)}</td>
                                <td>${escapeHtml(r.title)}</td>
                                <td>${renderStatusBadge("APPROVED", r.generatedByThread)}</td>
                                <td>${escapeHtml(String(r.generatedAt || "").replace("T", " ").slice(0, 19))}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    ` : "";

    container.innerHTML = `
        <div class="cream-card-surface">
            <div class="section-header-bar">
                <div>
                    <h2 class="section-heading">Administrator Institutional Overview</h2>
                    <p class="secondary-subtitle">Manage ${ov.departmentCount ?? 0} departments, ${ov.classCount ?? 0} classes, ${ov.studentCount ?? 0} students, full academic staff, and parallel reporting.</p>
                </div>
                <div class="action-toolbar">
                    <select id="gradingStrategySelect" class="cream-select-input" style="width:auto;" aria-label="Grading Strategy">
                        <option value="ABSOLUTE" ${ov.gradingStrategy === "ABSOLUTE" ? "selected" : ""}>Absolute Grading</option>
                        <option value="RELATIVE" ${ov.gradingStrategy === "RELATIVE" ? "selected" : ""}>Relative Grading</option>
                    </select>
                    <button type="button" id="saveJsonSnapshotButton" class="secondary-action-button">Save JSON Snapshot</button>
                    <button type="button" id="generateAllParallelButton" class="primary-action-button">Generate All Reports (Parallel)</button>
                </div>
            </div>
        </div>

        <div class="summary-metrics-grid">
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Departments</span><span class="metric-value">${ov.departmentCount ?? 0}</span><span class="metric-caption">Academic departments</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Classes</span><span class="metric-value">${ov.classCount ?? 0}</span><span class="metric-caption">Active sections</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Students</span><span class="metric-value">${ov.studentCount ?? 0}</span><span class="metric-caption">Enrolled learners</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Staff Team</span><span class="metric-value">${ov.facultyCount ?? 0}</span><span class="metric-caption">Deans, HODs &amp; Faculty</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Mean Attendance</span><span class="metric-value">${ov.averageAttendance ?? 0}%</span><span class="metric-caption">${ov.shortageCount ?? 0} below 75%</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Pass Rate</span><span class="metric-value">${ov.passPercentage ?? 0}%</span><span class="metric-caption">Mean score ${ov.averageAcademic ?? 0}%</span></div>
        </div>

        ${renderDepartmentCardsGrid(deptCards, `Academic Departments (${deptCards.length})`)}

        ${batchHtml}
    `;

    attachDepartmentCardListeners(container);

    document.getElementById("gradingStrategySelect")?.addEventListener("change", async event => {
        const target = /** @type {HTMLSelectElement} */ (event.target);
        try {
            await apiRequest("/api/system/grading-strategy", {
                method: "PUT",
                body: JSON.stringify({ strategy: target.value })
            });
            await refreshSharedCatalog();
            showGlobalFeedback(`Switched grading strategy to ${target.value}.`);
            renderAdminOverviewSection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Failed to update strategy.", "negative");
        }
    });

    document.getElementById("saveJsonSnapshotButton")?.addEventListener("click", async () => {
        try {
            const res = await apiRequest("/api/system/save", { method: "POST" });
            showGlobalFeedback(res.message);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Failed to save snapshot.", "negative");
        }
    });

    document.getElementById("generateAllParallelButton")?.addEventListener("click", async () => {
        try {
            applicationState.parallelBatchResult = await apiRequest("/api/reports/generate-all", { method: "POST" });
            showGlobalFeedback(`Generated ${applicationState.parallelBatchResult.totalGenerated} reports in parallel (${applicationState.parallelBatchResult.elapsedMilliseconds} ms).`);
            renderAdminOverviewSection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Parallel generation failed.", "negative");
        }
    });
}

function renderDeanOverviewSection(container) {
    const user = applicationState.currentUser;
    const overseenIds = user?.profile?.overseenDepartmentIds || [];
    const allCards = applicationState.overview?.departmentCards || [];
    const scopedCards = allCards.filter(c => overseenIds.includes(c.id));
    const cards = scopedCards.length > 0 ? scopedCards : allCards;

    const totalStudents = cards.reduce((acc, c) => acc + (c.studentCount || 0), 0);
    const totalClasses = cards.reduce((acc, c) => acc + (c.classCount || 0), 0);
    const totalShortage = cards.reduce((acc, c) => acc + (c.shortageCount || 0), 0);
    const meanAtt = cards.length > 0
        ? (cards.reduce((acc, c) => acc + (c.averageAttendance || 0), 0) / cards.length).toFixed(1)
        : "0.0";

    container.innerHTML = `
        <div class="cream-card-surface">
            <div class="section-header-bar">
                <div>
                    <h2 class="section-heading">Dean School Overview</h2>
                    <p class="secondary-subtitle">${escapeHtml(user?.profile?.designation || "Dean")} &bull; Overseeing ${cards.length} Academic Departments</p>
                </div>
                <div class="action-toolbar">
                    <button type="button" id="deanOpenDeptReportBtn" class="primary-action-button">Open Department Report</button>
                </div>
            </div>
        </div>

        <div class="summary-metrics-grid">
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Overseen Depts</span><span class="metric-value">${cards.length}</span><span class="metric-caption">Within your school</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Classes</span><span class="metric-value">${totalClasses}</span><span class="metric-caption">II &amp; III Year sections</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Students</span><span class="metric-value">${totalStudents}</span><span class="metric-caption">${totalShortage} attendance shortage</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Mean Attendance</span><span class="metric-value">${meanAtt}%</span><span class="metric-caption">School-wide average</span></div>
        </div>

        ${renderDepartmentCardsGrid(cards, `Overseen Departments (${cards.length})`)}
    `;

    attachDepartmentCardListeners(container);
    document.getElementById("deanOpenDeptReportBtn")?.addEventListener("click", async () => {
        applicationState.activeSection = "DEPARTMENT_REPORT";
        renderSidebarNavigation();
        await renderActiveSection();
    });
}

function renderAdminDepartmentsSection(container) {
    const editing = applicationState.departments.find(d => d.id === applicationState.editingDepartmentId) || null;
    const deptCards = applicationState.overview?.departmentCards || [];

    container.innerHTML = `
        ${renderDepartmentCardsGrid(deptCards, `All Academic Departments (${applicationState.departments.length})`)}

        <div class="cream-card-surface">
            <h2 class="section-heading">${editing ? "Edit Department" : "Add New Department"}</h2>
            <form id="departmentForm" class="form-grid" novalidate>
                <div class="form-field-group">
                    <label class="field-label" for="deptCodeInput">Department Code</label>
                    <input id="deptCodeInput" class="cream-text-input" value="${escapeHtml(editing?.code || "")}" placeholder="e.g. CSE" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="deptNameInput">Department Name</label>
                    <input id="deptNameInput" class="cream-text-input" value="${escapeHtml(editing?.name || "")}" placeholder="e.g. Computer Science" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="deptHodInput">Head of Department</label>
                    <input id="deptHodInput" class="cream-text-input" value="${escapeHtml(editing?.headOfDepartment || "")}" placeholder="e.g. Dr. N. Gopinath" required>
                </div>
                <div class="action-toolbar">
                    <button type="submit" class="primary-action-button">${editing ? "Update Department" : "Add Department"}</button>
                    ${editing ? `<button type="button" id="cancelDeptEditButton" class="secondary-action-button">Cancel</button>` : ""}
                </div>
            </form>
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Departments Directory (${applicationState.departments.length})</h3>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>ID</th><th>Code</th><th>Department Name</th><th>Head of Department</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${applicationState.departments.map(dept => `
                            <tr>
                                <td>${escapeHtml(dept.id)}</td>
                                <td><strong>${escapeHtml(dept.code)}</strong></td>
                                <td>${escapeHtml(dept.name)}</td>
                                <td>${escapeHtml(dept.headOfDepartment)}</td>
                                <td class="action-toolbar">
                                    <button type="button" class="secondary-action-button edit-dept-button" data-id="${escapeHtml(dept.id)}">Edit</button>
                                    <button type="button" class="negative-action-button delete-dept-button" data-id="${escapeHtml(dept.id)}">Delete</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    attachDepartmentCardListeners(container);

    document.getElementById("cancelDeptEditButton")?.addEventListener("click", () => {
        applicationState.editingDepartmentId = null;
        renderAdminDepartmentsSection(container);
    });

    document.getElementById("departmentForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        const code = /** @type {HTMLInputElement} */ (document.getElementById("deptCodeInput")).value.trim();
        const name = /** @type {HTMLInputElement} */ (document.getElementById("deptNameInput")).value.trim();
        const headOfDepartment = /** @type {HTMLInputElement} */ (document.getElementById("deptHodInput")).value.trim();
        if (!code || !name || !headOfDepartment) {
            showGlobalFeedback("All department fields are required.", "negative");
            return;
        }
        try {
            if (editing) {
                await apiRequest(`/api/departments/${encodeURIComponent(editing.id)}`, {
                    method: "PUT",
                    body: JSON.stringify({ code, name, headOfDepartment })
                });
                showGlobalFeedback(`Department ${code} updated.`);
            } else {
                await apiRequest("/api/departments", {
                    method: "POST",
                    body: JSON.stringify({ code, name, headOfDepartment })
                });
                showGlobalFeedback(`Department ${code} created.`);
            }
            applicationState.editingDepartmentId = null;
            await refreshSharedCatalog();
            renderAdminDepartmentsSection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Failed to save department.", "negative");
        }
    });

    container.querySelectorAll(".edit-dept-button").forEach(btn => {
        btn.addEventListener("click", () => {
            applicationState.editingDepartmentId = btn.getAttribute("data-id");
            renderAdminDepartmentsSection(container);
        });
    });

    container.querySelectorAll(".delete-dept-button").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (!id) return;
            try {
                await apiRequest(`/api/departments/${encodeURIComponent(id)}`, { method: "DELETE" });
                await refreshSharedCatalog();
                showGlobalFeedback(`Department ${id} removed.`);
                renderAdminDepartmentsSection(container);
            } catch (err) {
                showGlobalFeedback(err instanceof Error ? err.message : "Delete failed.", "negative");
            }
        });
    });
}

function renderAdminClassesSection(container) {
    const editing = applicationState.classes.find(c => c.id === applicationState.editingClassId) || null;
    container.innerHTML = `
        <div class="cream-card-surface">
            <h2 class="section-heading">${editing ? "Edit Academic Class" : "Add New Class"}</h2>
            <form id="classForm" class="form-grid" novalidate>
                <div class="form-field-group">
                    <label class="field-label" for="clsNameInput">Class Name</label>
                    <input id="clsNameInput" class="cream-text-input" value="${escapeHtml(editing?.name || "")}" placeholder="e.g. CSE II Year - Section C" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="clsDeptSelect">Department</label>
                    <select id="clsDeptSelect" class="cream-select-input">
                        ${applicationState.departments.map(d => `<option value="${escapeHtml(d.id)}" ${editing?.departmentId === d.id ? "selected" : ""}>${escapeHtml(d.code)} - ${escapeHtml(d.name)}</option>`).join("")}
                    </select>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="clsSemesterInput">Semester (1-8)</label>
                    <input id="clsSemesterInput" type="number" min="1" max="8" class="cream-text-input" value="${escapeHtml(editing?.semester ?? 4)}" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="clsSectionInput">Section</label>
                    <input id="clsSectionInput" class="cream-text-input" value="${escapeHtml(editing?.section || "A")}" placeholder="A" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="clsSubjectsInput">Subjects (comma-separated)</label>
                    <input id="clsSubjectsInput" class="cream-text-input" value="${escapeHtml((editing?.subjects || []).join(", "))}" placeholder="CS3401 Data Structures, CS3402 OOP" required>
                </div>
                <div class="action-toolbar">
                    <button type="submit" class="primary-action-button">${editing ? "Update Class" : "Add Class"}</button>
                    ${editing ? `<button type="button" id="cancelClassEditButton" class="secondary-action-button">Cancel</button>` : ""}
                </div>
            </form>
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Academic Classes (${applicationState.classes.length})</h3>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>ID</th><th>Class Name</th><th>Dept</th><th>Sem</th><th>Subjects</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${applicationState.classes.map(cls => `
                            <tr>
                                <td>${escapeHtml(cls.id)}</td>
                                <td><strong>${escapeHtml(cls.name)}</strong></td>
                                <td>${escapeHtml(cls.departmentId)}</td>
                                <td>Sem ${escapeHtml(cls.semester)} (${escapeHtml(cls.section)})</td>
                                <td>${escapeHtml((cls.subjects || []).join(", "))}</td>
                                <td class="action-toolbar">
                                    <button type="button" class="secondary-action-button edit-class-button" data-id="${escapeHtml(cls.id)}">Edit</button>
                                    <button type="button" class="negative-action-button delete-class-button" data-id="${escapeHtml(cls.id)}">Delete</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("cancelClassEditButton")?.addEventListener("click", () => {
        applicationState.editingClassId = null;
        renderAdminClassesSection(container);
    });

    document.getElementById("classForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        const name = /** @type {HTMLInputElement} */ (document.getElementById("clsNameInput")).value.trim();
        const departmentId = /** @type {HTMLSelectElement} */ (document.getElementById("clsDeptSelect")).value;
        const semester = Number(/** @type {HTMLInputElement} */ (document.getElementById("clsSemesterInput")).value);
        const section = /** @type {HTMLInputElement} */ (document.getElementById("clsSectionInput")).value.trim();
        const subjectsRaw = /** @type {HTMLInputElement} */ (document.getElementById("clsSubjectsInput")).value;
        const subjects = subjectsRaw.split(",").map(s => s.trim()).filter(Boolean);

        if (!name || !section || subjects.length === 0 || semester < 1 || semester > 8) {
            showGlobalFeedback("Please enter valid class name, semester (1-8), section, and at least one subject.", "negative");
            return;
        }
        try {
            if (editing) {
                await apiRequest(`/api/classes/${encodeURIComponent(editing.id)}`, {
                    method: "PUT",
                    body: JSON.stringify({ name, departmentId, semester, section, subjects })
                });
                showGlobalFeedback(`Class ${name} updated.`);
            } else {
                await apiRequest("/api/classes", {
                    method: "POST",
                    body: JSON.stringify({ name, departmentId, semester, section, subjects })
                });
                showGlobalFeedback(`Class ${name} added.`);
            }
            applicationState.editingClassId = null;
            await refreshSharedCatalog();
            renderAdminClassesSection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Failed to save class.", "negative");
        }
    });

    container.querySelectorAll(".edit-class-button").forEach(btn => {
        btn.addEventListener("click", () => {
            applicationState.editingClassId = btn.getAttribute("data-id");
            renderAdminClassesSection(container);
        });
    });

    container.querySelectorAll(".delete-class-button").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (!id) return;
            try {
                await apiRequest(`/api/classes/${encodeURIComponent(id)}`, { method: "DELETE" });
                await refreshSharedCatalog();
                showGlobalFeedback(`Class ${id} deleted.`);
                renderAdminClassesSection(container);
            } catch (err) {
                showGlobalFeedback(err instanceof Error ? err.message : "Delete failed.", "negative");
            }
        });
    });
}

function renderAdminStudentsSection(container) {
    const editing = applicationState.students.find(s => s.id === applicationState.editingStudentId) || null;
    const query = applicationState.studentSearchQuery.toLowerCase();

    let filtered = applicationState.students.filter(s => {
        const matchesSearch = !query
            || s.name.toLowerCase().includes(query)
            || s.rollNumber.toLowerCase().includes(query)
            || s.email.toLowerCase().includes(query);
        const matchesDept = applicationState.studentDepartmentFilter === "ALL" || s.departmentId === applicationState.studentDepartmentFilter;
        const matchesClass = applicationState.studentClassFilter === "ALL" || s.classId === applicationState.studentClassFilter;
        const matchesShortage = applicationState.studentShortageFilter === "ALL"
            || (applicationState.studentShortageFilter === "SHORTAGE" && s.attendancePercentage < 75)
            || (applicationState.studentShortageFilter === "ELIGIBLE" && s.attendancePercentage >= 75);
        return matchesSearch && matchesDept && matchesClass && matchesShortage;
    });

    const sortField = applicationState.studentSortField;
    const dir = applicationState.studentSortAscending ? 1 : -1;
    filtered = [...filtered].sort((a, b) => {
        if (typeof a[sortField] === "number" && typeof b[sortField] === "number") {
            return (a[sortField] - b[sortField]) * dir;
        }
        return String(a[sortField] ?? "").localeCompare(String(b[sortField] ?? "")) * dir;
    });

    container.innerHTML = `
        <div class="cream-card-surface">
            <h2 class="section-heading">${editing ? "Edit Student Record" : "Enroll New Student"}</h2>
            <form id="studentForm" class="form-grid" novalidate>
                <div class="form-field-group">
                    <label class="field-label" for="stuNameInput">Full Name</label>
                    <input id="stuNameInput" class="cream-text-input" value="${escapeHtml(editing?.name || "")}" placeholder="e.g. Anjali Nair" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="stuEmailInput">Email</label>
                    <input id="stuEmailInput" type="email" class="cream-text-input" value="${escapeHtml(editing?.email || "")}" placeholder="anjali.nair@college.edu" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="stuRollInput">Roll Number</label>
                    <input id="stuRollInput" class="cream-text-input" value="${escapeHtml(editing?.rollNumber || "")}" placeholder="24CSEA09" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="stuDeptSelect">Department</label>
                    <select id="stuDeptSelect" class="cream-select-input">
                        ${applicationState.departments.map(d => `<option value="${escapeHtml(d.id)}" ${editing?.departmentId === d.id ? "selected" : ""}>${escapeHtml(d.code)} - ${escapeHtml(d.name)}</option>`).join("")}
                    </select>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="stuClassSelect">Class</label>
                    <select id="stuClassSelect" class="cream-select-input">
                        ${applicationState.classes.map(c => `<option value="${escapeHtml(c.id)}" ${editing?.classId === c.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="stuSemInput">Semester</label>
                    <input id="stuSemInput" type="number" min="1" max="8" class="cream-text-input" value="${escapeHtml(editing?.semester ?? 4)}" required>
                </div>
                <div class="action-toolbar">
                    <button type="submit" class="primary-action-button">${editing ? "Update Student" : "Add Student"}</button>
                    ${editing ? `<button type="button" id="cancelStudentEditButton" class="secondary-action-button">Cancel</button>` : ""}
                </div>
            </form>
        </div>

        <div class="cream-card-surface">
            <div class="table-controls-bar">
                <h3 class="card-heading" style="margin:0;">Student Directory (${filtered.length} of ${applicationState.students.length})</h3>
                <div class="table-filter-group">
                    <input id="studentSearchInput" class="cream-text-input" style="width:200px;" placeholder="Search name, roll, email..." value="${escapeHtml(applicationState.studentSearchQuery)}">
                    <select id="studentDeptFilterSelect" class="cream-select-input" style="width:auto;">
                        <option value="ALL">All Departments</option>
                        ${applicationState.departments.map(d => `<option value="${escapeHtml(d.id)}" ${applicationState.studentDepartmentFilter === d.id ? "selected" : ""}>${escapeHtml(d.code)}</option>`).join("")}
                    </select>
                    <select id="studentClassFilterSelect" class="cream-select-input" style="width:auto;">
                        <option value="ALL">All Classes</option>
                        ${applicationState.classes.map(c => `<option value="${escapeHtml(c.id)}" ${applicationState.studentClassFilter === c.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                    <select id="studentShortageFilterSelect" class="cream-select-input" style="width:auto;">
                        <option value="ALL" ${applicationState.studentShortageFilter === "ALL" ? "selected" : ""}>All Attendance</option>
                        <option value="ELIGIBLE" ${applicationState.studentShortageFilter === "ELIGIBLE" ? "selected" : ""}>Eligible (&ge;75%)</option>
                        <option value="SHORTAGE" ${applicationState.studentShortageFilter === "SHORTAGE" ? "selected" : ""}>Shortage (&lt;75%)</option>
                    </select>
                </div>
            </div>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead>
                        <tr>
                            <th class="sortable-header" data-sort="rollNumber">Roll No</th>
                            <th class="sortable-header" data-sort="name">Name</th>
                            <th>Class</th>
                            <th class="sortable-header" data-sort="attendancePercentage">Attendance %</th>
                            <th class="sortable-header" data-sort="academicPercentage">Score %</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(stu => `
                            <tr>
                                <td><strong>${escapeHtml(stu.rollNumber)}</strong></td>
                                <td>${escapeHtml(stu.name)}<br><span class="secondary-subtitle">${escapeHtml(stu.email)}</span></td>
                                <td>${escapeHtml(stu.classId)}</td>
                                <td>${Number(stu.attendancePercentage).toFixed(1)}%</td>
                                <td>${Number(stu.academicPercentage).toFixed(1)}%</td>
                                <td>${stu.attendancePercentage < 75 ? renderStatusBadge("SHORTAGE", "Shortage") : renderStatusBadge("ELIGIBLE", "Eligible")}</td>
                                <td class="action-toolbar">
                                    <button type="button" class="secondary-action-button edit-student-button" data-id="${escapeHtml(stu.id)}">Edit</button>
                                    <button type="button" class="negative-action-button delete-student-button" data-id="${escapeHtml(stu.id)}">Delete</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("cancelStudentEditButton")?.addEventListener("click", () => {
        applicationState.editingStudentId = null;
        renderAdminStudentsSection(container);
    });

    document.getElementById("studentSearchInput")?.addEventListener("input", event => {
        applicationState.studentSearchQuery = /** @type {HTMLInputElement} */ (event.target).value;
        renderAdminStudentsSection(container);
    });

    document.getElementById("studentDeptFilterSelect")?.addEventListener("change", event => {
        applicationState.studentDepartmentFilter = /** @type {HTMLSelectElement} */ (event.target).value;
        renderAdminStudentsSection(container);
    });

    document.getElementById("studentClassFilterSelect")?.addEventListener("change", event => {
        applicationState.studentClassFilter = /** @type {HTMLSelectElement} */ (event.target).value;
        renderAdminStudentsSection(container);
    });

    document.getElementById("studentShortageFilterSelect")?.addEventListener("change", event => {
        applicationState.studentShortageFilter = /** @type {HTMLSelectElement} */ (event.target).value;
        renderAdminStudentsSection(container);
    });

    container.querySelectorAll(".sortable-header").forEach(header => {
        header.addEventListener("click", () => {
            const field = header.getAttribute("data-sort") || "rollNumber";
            if (applicationState.studentSortField === field) {
                applicationState.studentSortAscending = !applicationState.studentSortAscending;
            } else {
                applicationState.studentSortField = field;
                applicationState.studentSortAscending = true;
            }
            renderAdminStudentsSection(container);
        });
    });

    document.getElementById("studentForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        const name = /** @type {HTMLInputElement} */ (document.getElementById("stuNameInput")).value.trim();
        const email = /** @type {HTMLInputElement} */ (document.getElementById("stuEmailInput")).value.trim();
        const rollNumber = /** @type {HTMLInputElement} */ (document.getElementById("stuRollInput")).value.trim();
        const departmentId = /** @type {HTMLSelectElement} */ (document.getElementById("stuDeptSelect")).value;
        const classId = /** @type {HTMLSelectElement} */ (document.getElementById("stuClassSelect")).value;
        const semester = Number(/** @type {HTMLInputElement} */ (document.getElementById("stuSemInput")).value);

        if (!name || !email.includes("@") || !rollNumber) {
            showGlobalFeedback("Please enter a valid student name, email address, and roll number.", "negative");
            return;
        }
        try {
            if (editing) {
                await apiRequest(`/api/students/${encodeURIComponent(editing.id)}`, {
                    method: "PUT",
                    body: JSON.stringify({ name, email, rollNumber, departmentId, classId, semester })
                });
                showGlobalFeedback(`Updated student ${name}.`);
            } else {
                await apiRequest("/api/students", {
                    method: "POST",
                    body: JSON.stringify({ name, email, rollNumber, departmentId, classId, semester, attendancePercentage: 100, academicPercentage: 0 })
                });
                showGlobalFeedback(`Enrolled student ${name}.`);
            }
            applicationState.editingStudentId = null;
            await refreshSharedCatalog();
            renderAdminStudentsSection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Failed to save student.", "negative");
        }
    });

    container.querySelectorAll(".edit-student-button").forEach(btn => {
        btn.addEventListener("click", () => {
            applicationState.editingStudentId = btn.getAttribute("data-id");
            renderAdminStudentsSection(container);
        });
    });

    container.querySelectorAll(".delete-student-button").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (!id) return;
            try {
                await apiRequest(`/api/students/${encodeURIComponent(id)}`, { method: "DELETE" });
                await refreshSharedCatalog();
                showGlobalFeedback(`Student ${id} removed.`);
                renderAdminStudentsSection(container);
            } catch (err) {
                showGlobalFeedback(err instanceof Error ? err.message : "Delete failed.", "negative");
            }
        });
    });
}

function renderAdminFacultySection(container) {
    const editing = applicationState.faculty.find(f => f.id === applicationState.editingFacultyId) || null;
    container.innerHTML = `
        <div class="cream-card-surface">
            <h2 class="section-heading">${editing ? "Edit Faculty Profile" : "Add New Faculty Member"}</h2>
            <form id="facultyForm" class="form-grid" novalidate>
                <div class="form-field-group">
                    <label class="field-label" for="facNameInput">Full Name</label>
                    <input id="facNameInput" class="cream-text-input" value="${escapeHtml(editing?.name || "")}" placeholder="e.g. Prof. K. Arumugam" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="facEmailInput">Email</label>
                    <input id="facEmailInput" type="email" class="cream-text-input" value="${escapeHtml(editing?.email || "")}" placeholder="arumugam.k@college.edu" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="facDeptSelect">Department</label>
                    <select id="facDeptSelect" class="cream-select-input">
                        ${applicationState.departments.map(d => `<option value="${escapeHtml(d.id)}" ${editing?.departmentId === d.id ? "selected" : ""}>${escapeHtml(d.code)} - ${escapeHtml(d.name)}</option>`).join("")}
                    </select>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="facDesigInput">Designation</label>
                    <input id="facDesigInput" class="cream-text-input" value="${escapeHtml(editing?.designation || "Assistant Professor")}" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="facClassesInput">Assigned Class IDs (comma-separated)</label>
                    <input id="facClassesInput" class="cream-text-input" value="${escapeHtml((editing?.assignedClassIds || ["CLS-CSE-2A"]).join(", "))}" required>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="facSubjectsInput">Subjects (comma-separated)</label>
                    <input id="facSubjectsInput" class="cream-text-input" value="${escapeHtml((editing?.subjects || ["CS3401 Data Structures"]).join(", "))}" required>
                </div>
                <div class="action-toolbar">
                    <button type="submit" class="primary-action-button">${editing ? "Update Faculty" : "Add Faculty"}</button>
                    ${editing ? `<button type="button" id="cancelFacEditButton" class="secondary-action-button">Cancel</button>` : ""}
                </div>
            </form>
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Subject Faculty Directory (${applicationState.faculty.length})</h3>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Classes</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${applicationState.faculty.map(fac => `
                            <tr>
                                <td>${escapeHtml(fac.id)}</td>
                                <td><strong>${escapeHtml(fac.name)}</strong><br><span class="secondary-subtitle">${escapeHtml(fac.email)}</span></td>
                                <td>${escapeHtml(fac.departmentId)}</td>
                                <td>${escapeHtml(fac.designation)}</td>
                                <td>${escapeHtml((fac.assignedClassIds || []).join(", "))}</td>
                                <td class="action-toolbar">
                                    <button type="button" class="secondary-action-button edit-faculty-button" data-id="${escapeHtml(fac.id)}">Edit</button>
                                    <button type="button" class="negative-action-button delete-faculty-button" data-id="${escapeHtml(fac.id)}">Delete</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("cancelFacEditButton")?.addEventListener("click", () => {
        applicationState.editingFacultyId = null;
        renderAdminFacultySection(container);
    });

    document.getElementById("facultyForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        const name = /** @type {HTMLInputElement} */ (document.getElementById("facNameInput")).value.trim();
        const email = /** @type {HTMLInputElement} */ (document.getElementById("facEmailInput")).value.trim();
        const departmentId = /** @type {HTMLSelectElement} */ (document.getElementById("facDeptSelect")).value;
        const designation = /** @type {HTMLInputElement} */ (document.getElementById("facDesigInput")).value.trim();
        const assignedClassIds = /** @type {HTMLInputElement} */ (document.getElementById("facClassesInput")).value.split(",").map(s => s.trim()).filter(Boolean);
        const subjects = /** @type {HTMLInputElement} */ (document.getElementById("facSubjectsInput")).value.split(",").map(s => s.trim()).filter(Boolean);

        if (!name || !email.includes("@") || !designation) {
            showGlobalFeedback("Please enter valid faculty name, email, and designation.", "negative");
            return;
        }
        try {
            if (editing) {
                await apiRequest(`/api/faculty/${encodeURIComponent(editing.id)}`, {
                    method: "PUT",
                    body: JSON.stringify({ name, email, departmentId, designation, assignedClassIds, subjects })
                });
                showGlobalFeedback(`Updated faculty ${name}.`);
            } else {
                await apiRequest("/api/faculty", {
                    method: "POST",
                    body: JSON.stringify({ name, email, departmentId, designation, assignedClassIds, subjects })
                });
                showGlobalFeedback(`Added faculty ${name}.`);
            }
            applicationState.editingFacultyId = null;
            await refreshSharedCatalog();
            renderAdminFacultySection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Failed to save faculty.", "negative");
        }
    });

    container.querySelectorAll(".edit-faculty-button").forEach(btn => {
        btn.addEventListener("click", () => {
            applicationState.editingFacultyId = btn.getAttribute("data-id");
            renderAdminFacultySection(container);
        });
    });

    container.querySelectorAll(".delete-faculty-button").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (!id) return;
            try {
                await apiRequest(`/api/faculty/${encodeURIComponent(id)}`, { method: "DELETE" });
                await refreshSharedCatalog();
                showGlobalFeedback(`Faculty ${id} removed.`);
                renderAdminFacultySection(container);
            } catch (err) {
                showGlobalFeedback(err instanceof Error ? err.message : "Delete failed.", "negative");
            }
        });
    });
}

/* ==================== DEPARTMENT REPORT & STAFF DIRECTORY ==================== */

function getFilteredDepartmentStaff() {
    const query = applicationState.staffSearchQuery.toLowerCase().trim();
    const roleFilter = applicationState.staffRoleFilter;
    return applicationState.departmentStaffList.filter(staff => {
        const matchesRole = roleFilter === "ALL" || staff.roleTitle === roleFilter;
        const subjectsText = (staff.subjects || []).join(" ").toLowerCase();
        const classesText = (staff.assignedClassIds || []).join(" ").toLowerCase();
        const matchesSearch = !query
            || String(staff.name || "").toLowerCase().includes(query)
            || String(staff.email || "").toLowerCase().includes(query)
            || String(staff.roleTitle || "").toLowerCase().includes(query)
            || subjectsText.includes(query)
            || classesText.includes(query);
        return matchesRole && matchesSearch;
    });
}

function renderStaffDirectoryRowsHtml(staffRows) {
    if (!staffRows || staffRows.length === 0) {
        return `<tr><td colspan="5" class="secondary-subtitle">No staff members match the active search or role filter.</td></tr>`;
    }
    return staffRows.map(staff => `
        <tr>
            <td>
                <strong>${escapeHtml(staff.name)}</strong>
                <div class="secondary-subtitle" style="font-size:0.78rem;">${escapeHtml(staff.designation)}</div>
            </td>
            <td>${renderStaffRoleBadge(staff.roleTitle)}</td>
            <td>${(staff.subjects && staff.subjects.length > 0) ? escapeHtml(staff.subjects.join(", ")) : `<span class="secondary-subtitle">Department Governance</span>`}</td>
            <td>${(staff.assignedClassIds && staff.assignedClassIds.length > 0) ? escapeHtml(staff.assignedClassIds.join(", ")) : `<span class="secondary-subtitle">All Dept Classes</span>`}</td>
            <td>${escapeHtml(staff.email)}</td>
        </tr>
    `).join("");
}

async function renderDepartmentReportSection(container) {
    const scopedDepts = getScopedDepartmentsForUser();
    const fallbackDeptId = scopedDepts[0]?.id || "DEPT-CSE";
    const selectedDeptId = scopedDepts.some(d => d.id === applicationState.selectedDepartmentReportId)
        ? applicationState.selectedDepartmentReportId
        : fallbackDeptId;
    applicationState.selectedDepartmentReportId = selectedDeptId;

    const [report, staffList] = await Promise.all([
        apiRequest(`/api/reports/department/${encodeURIComponent(selectedDeptId)}`),
        apiRequest(`/api/departments/${encodeURIComponent(selectedDeptId)}/staff`)
    ]);
    applicationState.activeReport = report;
    applicationState.departmentStaffList = staffList;
    const m = report.summaryMetrics || {};
    const chart = report.chartSeries || {};
    const filteredStaff = getFilteredDepartmentStaff();
    const roleOptions = ["Dean", "Head of Department", "Academic Coordinator", "Exam Cell Coordinator", "Class Advisor", "Lab Instructor", "Subject Faculty"];

    container.innerHTML = `
        <div class="cream-card-surface">
            <div class="section-header-bar">
                <div>
                    <h2 class="section-heading">${escapeHtml(report.title)}</h2>
                    <p class="secondary-subtitle">${escapeHtml(report.subtitle)}</p>
                </div>
                <div class="action-toolbar no-print">
                    <select id="deptReportSelect" class="cream-select-input" style="width:auto;" aria-label="Select Department">
                        ${scopedDepts.map(d => `<option value="${escapeHtml(d.id)}" ${d.id === selectedDeptId ? "selected" : ""}>${escapeHtml(d.code)} - ${escapeHtml(d.name)}</option>`).join("")}
                    </select>
                    <button type="button" id="printReportButton" class="secondary-action-button">Print Report</button>
                    <button type="button" id="downloadDeptCsvButton" class="primary-action-button">Download CSV</button>
                </div>
            </div>
        </div>

        <div class="summary-metrics-grid">
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Avg Attendance</span><span class="metric-value">${m.averageAttendance ?? 0}%</span><span class="metric-caption">${m.shortageCount ?? 0} shortage students</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Average Marks</span><span class="metric-value">${m.averageMarks ?? 0}%</span><span class="metric-caption">${m.totalStudents ?? 0} total students</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Pass Percentage</span><span class="metric-value">${m.passPercentage ?? 0}%</span><span class="metric-caption">${m.totalClasses ?? 0} classes</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Department Topper</span><span class="metric-value">${m.topperScore ?? 0}%</span><span class="metric-caption">${escapeHtml(m.topperName)} (${escapeHtml(m.topperRollNumber)})</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Staff Team</span><span class="metric-value">${staffList.length}</span><span class="metric-caption">Full department faculty</span></div>
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Section-Wise Attendance vs Marks Comparison</h3>
            ${buildInlineSvgBarChart(chart.labels || [], chart.marks || [], chart.attendance || [], "Average Marks %", "Average Attendance %")}
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Class Breakdown</h3>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>Class</th><th>Students</th><th>Avg Attendance</th><th>Avg Marks</th><th>Pass %</th><th>Class Topper</th></tr></thead>
                    <tbody>
                        ${(report.primaryRows || []).map(r => `
                            <tr>
                                <td><strong>${escapeHtml(r.className)}</strong></td>
                                <td>${r.studentCount}</td>
                                <td>${r.averageAttendance}%</td>
                                <td>${r.averageMarks}%</td>
                                <td>${renderStatusBadge(r.passPercentage >= 60 ? "PASS" : "PENDING", `${r.passPercentage}%`)}</td>
                                <td>${escapeHtml(r.topper)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
            <div class="report-thread-footer">
                <span>${escapeHtml(report.remarks)}</span>
                <span><strong>Worker Thread:</strong> ${escapeHtml(report.generatedByThread)} | Strategy: ${escapeHtml(report.gradingStrategy)}</span>
            </div>
        </div>

        <div class="cream-card-surface">
            <div class="table-controls-bar">
                <div>
                    <h3 id="staffDirectoryHeading" class="card-heading" style="margin:0;">STAFF DIRECTORY (${filteredStaff.length} of ${staffList.length} Members)</h3>
                    <p class="secondary-subtitle">Department leadership, class advisors, lab instructors, and subject faculty</p>
                </div>
                <div class="table-filter-group no-print">
                    <input id="staffSearchInput" class="cream-text-input" style="width:220px;" placeholder="Search staff, subject, class..." value="${escapeHtml(applicationState.staffSearchQuery)}">
                    <select id="staffRoleFilterSelect" class="cream-select-input" style="width:auto;" aria-label="Filter by Role">
                        <option value="ALL">All Staff Roles</option>
                        ${roleOptions.map(r => `<option value="${escapeHtml(r)}" ${applicationState.staffRoleFilter === r ? "selected" : ""}>${escapeHtml(r)}</option>`).join("")}
                    </select>
                </div>
            </div>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>Name</th><th>Role</th><th>Subjects Handled</th><th>Classes Handled</th><th>Email</th></tr></thead>
                    <tbody id="staffDirectoryTableBody">
                        ${renderStaffDirectoryRowsHtml(filteredStaff)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("deptReportSelect")?.addEventListener("change", async event => {
        applicationState.selectedDepartmentReportId = /** @type {HTMLSelectElement} */ (event.target).value;
        await renderDepartmentReportSection(container);
    });

    const updateStaffTableInPlace = () => {
        const rows = getFilteredDepartmentStaff();
        const tbody = document.getElementById("staffDirectoryTableBody");
        const heading = document.getElementById("staffDirectoryHeading");
        if (tbody) tbody.innerHTML = renderStaffDirectoryRowsHtml(rows);
        if (heading) heading.textContent = `STAFF DIRECTORY (${rows.length} of ${applicationState.departmentStaffList.length} Members)`;
    };

    document.getElementById("staffSearchInput")?.addEventListener("input", event => {
        applicationState.staffSearchQuery = /** @type {HTMLInputElement} */ (event.target).value;
        updateStaffTableInPlace();
    });

    document.getElementById("staffRoleFilterSelect")?.addEventListener("change", event => {
        applicationState.staffRoleFilter = /** @type {HTMLSelectElement} */ (event.target).value;
        updateStaffTableInPlace();
    });

    document.getElementById("printReportButton")?.addEventListener("click", () => window.print());
    document.getElementById("downloadDeptCsvButton")?.addEventListener("click", () => {
        const rows = (report.primaryRows || []).map(r => [r.classId, r.className, r.studentCount, r.averageAttendance, r.averageMarks, r.passPercentage, r.topper]);
        downloadCsvFile(`department-report-${selectedDeptId}.csv`, ["Class ID", "Class Name", "Students", "Avg Attendance %", "Avg Marks %", "Pass %", "Topper"], rows);
    });
}

/* ==================== EXAM CELL COORDINATOR SECTION ==================== */

function getFilteredExamCellRows() {
    return applicationState.examCellAssessments.filter(row => {
        const matchClass = applicationState.examCellClassFilter === "ALL" || row.classId === applicationState.examCellClassFilter;
        const matchSub = applicationState.examCellSubjectFilter === "ALL" || row.subject === applicationState.examCellSubjectFilter;
        const matchStatus = applicationState.examCellStatusFilter === "ALL"
            || (applicationState.examCellStatusFilter === "VERIFIED" && row.verifiedByExamCell)
            || (applicationState.examCellStatusFilter === "PENDING" && !row.verifiedByExamCell);
        return matchClass && matchSub && matchStatus;
    });
}

async function renderExamCellVerificationSection(container) {
    const user = applicationState.currentUser;
    const deptId = user?.profile?.departmentId || "DEPT-CSE";
    const dept = applicationState.departments.find(d => d.id === deptId);
    const deptClasses = applicationState.classes.filter(c => c.departmentId === deptId);

    const assessments = await apiRequest(`/api/assessments/department/${encodeURIComponent(deptId)}`);
    applicationState.examCellAssessments = assessments;

    const subjectsSet = Array.from(new Set(assessments.map(a => a.subject))).sort();
    const filtered = getFilteredExamCellRows();
    const verifiedTotal = assessments.filter(a => a.verifiedByExamCell).length;
    const pendingTotal = assessments.length - verifiedTotal;
    const pendingFilteredIds = filtered.filter(a => !a.verifiedByExamCell).map(a => a.id);

    container.innerHTML = `
        <div class="cream-card-surface">
            <div class="section-header-bar">
                <div>
                    <h2 class="section-heading">Exam Cell Internal Marks Verification — ${escapeHtml(dept?.code || deptId)}</h2>
                    <p class="secondary-subtitle">Review and verify internal test, assignment, and lab record scores submitted by subject faculty.</p>
                </div>
                <div class="action-toolbar">
                    <button type="button" id="verifyAllFilteredButton" class="primary-action-button" ${pendingFilteredIds.length === 0 ? "disabled" : ""}>
                        Verify All Filtered Pending (${pendingFilteredIds.length})
                    </button>
                </div>
            </div>
        </div>

        <div class="summary-metrics-grid">
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Total Entries</span><span class="metric-value">${assessments.length}</span><span class="metric-caption">${escapeHtml(dept?.name || deptId)}</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Verified</span><span class="metric-value">${verifiedTotal}</span><span class="metric-caption">Approved for transcript</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Pending Audit</span><span class="metric-value">${pendingTotal}</span><span class="metric-caption">Awaiting Exam Cell check</span></div>
        </div>

        <div class="cream-card-surface">
            <div class="table-controls-bar">
                <h3 class="card-heading" style="margin:0;">Assessment Verification Queue (${filtered.length} Records)</h3>
                <div class="table-filter-group">
                    <select id="examCellClassSelect" class="cream-select-input" style="width:auto;">
                        <option value="ALL">All Dept Classes</option>
                        ${deptClasses.map(c => `<option value="${escapeHtml(c.id)}" ${applicationState.examCellClassFilter === c.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                    <select id="examCellSubjectSelect" class="cream-select-input" style="width:auto;">
                        <option value="ALL">All Subjects</option>
                        ${subjectsSet.map(s => `<option value="${escapeHtml(s)}" ${applicationState.examCellSubjectFilter === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
                    </select>
                    <select id="examCellStatusSelect" class="cream-select-input" style="width:auto;">
                        <option value="ALL" ${applicationState.examCellStatusFilter === "ALL" ? "selected" : ""}>All Statuses</option>
                        <option value="PENDING" ${applicationState.examCellStatusFilter === "PENDING" ? "selected" : ""}>Pending Verification</option>
                        <option value="VERIFIED" ${applicationState.examCellStatusFilter === "VERIFIED" ? "selected" : ""}>Verified</option>
                    </select>
                </div>
            </div>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>Roll No</th><th>Student</th><th>Class</th><th>Subject</th><th>Category</th><th>Marks</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        ${filtered.slice(0, 80).map(row => `
                            <tr>
                                <td><strong>${escapeHtml(row.rollNumber)}</strong></td>
                                <td>${escapeHtml(row.studentName)}</td>
                                <td>${escapeHtml(row.classId)}</td>
                                <td>${escapeHtml(row.subject)}</td>
                                <td>${escapeHtml(row.category)}</td>
                                <td><strong>${row.marksObtained}</strong> / ${row.maxMarks}</td>
                                <td>${row.verifiedByExamCell ? renderStatusBadge("VERIFIED", "Verified") : renderStatusBadge("PENDING", "Pending")}</td>
                                <td>
                                    ${row.verifiedByExamCell
                                        ? `<span class="secondary-subtitle" style="font-size:0.78rem;">By ${escapeHtml(row.verifiedBy || "Exam Cell")}</span>`
                                        : `<button type="button" class="primary-action-button verify-single-assessment-btn" style="padding:6px 12px;font-size:0.8rem;" data-id="${escapeHtml(row.id)}">Verify</button>`}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("examCellClassSelect")?.addEventListener("change", event => {
        applicationState.examCellClassFilter = /** @type {HTMLSelectElement} */ (event.target).value;
        renderExamCellVerificationSection(container);
    });
    document.getElementById("examCellSubjectSelect")?.addEventListener("change", event => {
        applicationState.examCellSubjectFilter = /** @type {HTMLSelectElement} */ (event.target).value;
        renderExamCellVerificationSection(container);
    });
    document.getElementById("examCellStatusSelect")?.addEventListener("change", event => {
        applicationState.examCellStatusFilter = /** @type {HTMLSelectElement} */ (event.target).value;
        renderExamCellVerificationSection(container);
    });

    const verifyIds = async ids => {
        if (!ids || ids.length === 0) return;
        try {
            const res = await apiRequest("/api/assessments/verify", {
                method: "POST",
                body: JSON.stringify({ assessmentIds: ids, verifierId: user?.id || "EXAM-CELL" })
            });
            showGlobalFeedback(`Verified ${res.verifiedCount} internal assessment record(s) as ${user?.name || "Exam Cell Coordinator"}.`);
            await renderExamCellVerificationSection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Verification failed.", "negative");
        }
    };

    document.getElementById("verifyAllFilteredButton")?.addEventListener("click", () => verifyIds(pendingFilteredIds));
    container.querySelectorAll(".verify-single-assessment-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            if (id) verifyIds([id]);
        });
    });
}

/* ==================== FACULTY & CLASS ADVISOR SECTIONS ==================== */

function getFacultyClasses() {
    return getScopedClassesForUser();
}

function getAllowedSubjectsForClass(selectedClass) {
    const classSubjects = selectedClass?.subjects || [];
    const user = applicationState.currentUser;
    if (user?.role === "FACULTY") {
        const facultySubjects = user.profile?.subjects || [];
        if (facultySubjects.length > 0) {
            const intersection = classSubjects.filter(s => facultySubjects.includes(s));
            if (intersection.length > 0) {
                return intersection;
            }
        }
    }
    return classSubjects;
}

async function renderFacultyAttendanceSection(container) {
    const availableClasses = getFacultyClasses();
    if (!applicationState.facultySelectedClassId || !availableClasses.some(c => c.id === applicationState.facultySelectedClassId)) {
        applicationState.facultySelectedClassId = availableClasses[0]?.id || "";
    }
    const selectedClass = availableClasses.find(c => c.id === applicationState.facultySelectedClassId) || availableClasses[0];
    const subjects = getAllowedSubjectsForClass(selectedClass);
    if (!subjects.includes(applicationState.facultySelectedSubject)) {
        applicationState.facultySelectedSubject = subjects[0] || "";
    }

    const classStudents = applicationState.students.filter(s => s.classId === selectedClass?.id);
    const existingRecords = selectedClass && applicationState.facultySelectedSubject
        ? await apiRequest(`/api/attendance/class?classId=${encodeURIComponent(selectedClass.id)}&subject=${encodeURIComponent(applicationState.facultySelectedSubject)}&date=${encodeURIComponent(applicationState.facultySelectedDate)}`)
        : [];

    const draft = {};
    for (const stu of classStudents) {
        const match = existingRecords.find(r => r.studentId === stu.id);
        draft[stu.id] = match ? match.status : (applicationState.facultyAttendanceDraft[stu.id] || "PRESENT");
    }
    applicationState.facultyAttendanceDraft = draft;

    container.innerHTML = `
        <div class="cream-card-surface">
            <div class="section-header-bar">
                <div>
                    <h2 class="section-heading">Daily Attendance Register</h2>
                    <p class="secondary-subtitle">Thread-safe marking protected by ReentrantReadWriteLock. Scoped to your assigned classes and subjects.</p>
                </div>
                <div class="action-toolbar">
                    <button type="button" id="bulkMarkAllPresentButton" class="secondary-action-button">Bulk Mark All Present</button>
                    <button type="button" id="saveAttendanceGridButton" class="primary-action-button">Save Attendance Grid</button>
                </div>
            </div>

            <div class="form-grid" style="margin-top:14px;">
                <div class="form-field-group">
                    <label class="field-label" for="facultyClassSelect">Class Section</label>
                    <select id="facultyClassSelect" class="cream-select-input">
                        ${availableClasses.map(c => `<option value="${escapeHtml(c.id)}" ${c.id === selectedClass?.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="facultySubjectSelect">Subject</label>
                    <select id="facultySubjectSelect" class="cream-select-input">
                        ${subjects.map(sub => `<option value="${escapeHtml(sub)}" ${sub === applicationState.facultySelectedSubject ? "selected" : ""}>${escapeHtml(sub)}</option>`).join("")}
                    </select>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="facultyDateInput">Session Date</label>
                    <input id="facultyDateInput" type="date" class="cream-text-input" value="${escapeHtml(applicationState.facultySelectedDate)}">
                </div>
            </div>
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Student Attendance Grid (${classStudents.length} Students)</h3>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>Roll No</th><th>Student Name</th><th>Cumulative %</th><th>Eligibility</th><th>Session Status</th></tr></thead>
                    <tbody>
                        ${classStudents.map(stu => {
                            const status = applicationState.facultyAttendanceDraft[stu.id] || "PRESENT";
                            return `
                                <tr>
                                    <td><strong>${escapeHtml(stu.rollNumber)}</strong></td>
                                    <td>${escapeHtml(stu.name)}</td>
                                    <td>${Number(stu.attendancePercentage).toFixed(1)}%</td>
                                    <td>${stu.attendancePercentage < 75 ? renderStatusBadge("SHORTAGE", "Shortage") : renderStatusBadge("ELIGIBLE", "Eligible")}</td>
                                    <td>
                                        <div class="attendance-toggle-group">
                                            <button type="button" class="attendance-choice-button ${status === "PRESENT" ? "selected-present" : ""}" data-stu="${escapeHtml(stu.id)}" data-status="PRESENT">Present</button>
                                            <button type="button" class="attendance-choice-button ${status === "ABSENT" ? "selected-absent" : ""}" data-stu="${escapeHtml(stu.id)}" data-status="ABSENT">Absent</button>
                                            <button type="button" class="attendance-choice-button ${status === "PENDING" ? "selected-pending" : ""}" data-stu="${escapeHtml(stu.id)}" data-status="PENDING">Pending</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("facultyClassSelect")?.addEventListener("change", async event => {
        applicationState.facultySelectedClassId = /** @type {HTMLSelectElement} */ (event.target).value;
        applicationState.facultyAttendanceDraft = {};
        await renderFacultyAttendanceSection(container);
    });

    document.getElementById("facultySubjectSelect")?.addEventListener("change", async event => {
        applicationState.facultySelectedSubject = /** @type {HTMLSelectElement} */ (event.target).value;
        applicationState.facultyAttendanceDraft = {};
        await renderFacultyAttendanceSection(container);
    });

    document.getElementById("facultyDateInput")?.addEventListener("change", async event => {
        applicationState.facultySelectedDate = /** @type {HTMLInputElement} */ (event.target).value;
        applicationState.facultyAttendanceDraft = {};
        await renderFacultyAttendanceSection(container);
    });

    container.querySelectorAll(".attendance-choice-button").forEach(button => {
        button.addEventListener("click", () => {
            const stuId = button.getAttribute("data-stu") || "";
            const status = button.getAttribute("data-status") || "PRESENT";
            applicationState.facultyAttendanceDraft[stuId] = status;
            const group = button.parentElement;
            group?.querySelectorAll(".attendance-choice-button").forEach(b => {
                b.classList.remove("selected-present", "selected-absent", "selected-pending");
            });
            button.classList.add(status === "PRESENT" ? "selected-present" : status === "ABSENT" ? "selected-absent" : "selected-pending");
        });
    });

    document.getElementById("bulkMarkAllPresentButton")?.addEventListener("click", async () => {
        if (!selectedClass) return;
        try {
            await apiRequest("/api/attendance/bulk", {
                method: "POST",
                body: JSON.stringify({
                    classId: selectedClass.id,
                    subject: applicationState.facultySelectedSubject,
                    date: applicationState.facultySelectedDate,
                    status: "PRESENT",
                    markedBy: applicationState.currentUser?.id || "STF-CSE-FAC1"
                })
            });
            await refreshSharedCatalog();
            showGlobalFeedback(`Marked all students in ${selectedClass.name} PRESENT for ${applicationState.facultySelectedSubject}.`);
            await renderFacultyAttendanceSection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Bulk update failed.", "negative");
        }
    });

    document.getElementById("saveAttendanceGridButton")?.addEventListener("click", async () => {
        if (!selectedClass) return;
        try {
            await apiRequest("/api/attendance/grid", {
                method: "POST",
                body: JSON.stringify({
                    classId: selectedClass.id,
                    subject: applicationState.facultySelectedSubject,
                    date: applicationState.facultySelectedDate,
                    markedBy: applicationState.currentUser?.id || "STF-CSE-FAC1",
                    statuses: applicationState.facultyAttendanceDraft
                })
            });
            await refreshSharedCatalog();
            showGlobalFeedback(`Saved attendance grid for ${selectedClass.name} (${applicationState.facultySelectedDate}).`);
            await renderFacultyAttendanceSection(container);
        } catch (err) {
            showGlobalFeedback(err instanceof Error ? err.message : "Failed to save attendance.", "negative");
        }
    });
}

async function renderFacultyMarksSection(container) {
    const availableClasses = getFacultyClasses();
    if (!applicationState.facultySelectedClassId || !availableClasses.some(c => c.id === applicationState.facultySelectedClassId)) {
        applicationState.facultySelectedClassId = availableClasses[0]?.id || "";
    }
    const selectedClass = availableClasses.find(c => c.id === applicationState.facultySelectedClassId) || availableClasses[0];
    const subjects = getAllowedSubjectsForClass(selectedClass);
    if (!subjects.includes(applicationState.facultySelectedSubject)) {
        applicationState.facultySelectedSubject = subjects[0] || "";
    }

    const category = applicationState.facultyAssessmentCategory;
    const maxMarks = category === "INTERNAL_TEST" ? 50 : 25;
    const classStudents = applicationState.students.filter(s => s.classId === selectedClass?.id);
    const assessments = selectedClass && applicationState.facultySelectedSubject
        ? await apiRequest(`/api/assessments/class?classId=${encodeURIComponent(selectedClass.id)}&subject=${encodeURIComponent(applicationState.facultySelectedSubject)}`)
        : [];

    container.innerHTML = `
        <div class="cream-card-surface">
            <div class="section-header-bar">
                <div>
                    <h2 class="section-heading">Internal Assessment Marks Entry</h2>
                    <p class="secondary-subtitle">Enter and update marks for Internal Tests (Max 50), Assignments (Max 25), and Lab Records (Max 25).</p>
                </div>
            </div>
            <div class="form-grid" style="margin-top:14px;">
                <div class="form-field-group">
                    <label class="field-label" for="marksClassSelect">Class Section</label>
                    <select id="marksClassSelect" class="cream-select-input">
                        ${availableClasses.map(c => `<option value="${escapeHtml(c.id)}" ${c.id === selectedClass?.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="marksSubjectSelect">Subject</label>
                    <select id="marksSubjectSelect" class="cream-select-input">
                        ${subjects.map(sub => `<option value="${escapeHtml(sub)}" ${sub === applicationState.facultySelectedSubject ? "selected" : ""}>${escapeHtml(sub)}</option>`).join("")}
                    </select>
                </div>
                <div class="form-field-group">
                    <label class="field-label" for="marksCategorySelect">Assessment Component</label>
                    <select id="marksCategorySelect" class="cream-select-input">
                        <option value="INTERNAL_TEST" ${category === "INTERNAL_TEST" ? "selected" : ""}>Internal Test (Max 50, Weight 50%)</option>
                        <option value="ASSIGNMENT" ${category === "ASSIGNMENT" ? "selected" : ""}>Assignment (Max 25, Weight 25%)</option>
                        <option value="LAB_RECORD" ${category === "LAB_RECORD" ? "selected" : ""}>Lab Record &amp; Viva (Max 25, Weight 25%)</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Student Marks Table (${escapeHtml(applicationState.facultySelectedSubject)} — Max ${maxMarks})</h3>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>Roll No</th><th>Student</th><th>Marks (0 - ${maxMarks})</th><th>Weighted Score</th><th>Overall %</th><th>Exam Cell</th><th>Action</th></tr></thead>
                    <tbody>
                        ${classStudents.map(stu => {
                            const existing = assessments.find(a => a.studentId === stu.id && a.assessmentCategory === category);
                            const currentMarks = existing ? existing.marksObtained : 0;
                            const weighted = existing ? existing.weightedScore : 0;
                            const verified = Boolean(existing?.verifiedByExamCell);
                            return `
                                <tr>
                                    <td><strong>${escapeHtml(stu.rollNumber)}</strong></td>
                                    <td>${escapeHtml(stu.name)}</td>
                                    <td>
                                        <input type="number" step="0.5" min="0" max="${maxMarks}"
                                               class="marks-number-input student-marks-input"
                                               data-student-id="${escapeHtml(stu.id)}"
                                               value="${currentMarks}">
                                    </td>
                                    <td>${Number(weighted).toFixed(2)}</td>
                                    <td>${Number(stu.academicPercentage).toFixed(1)}%</td>
                                    <td>${verified ? renderStatusBadge("VERIFIED", "Verified") : renderStatusBadge("PENDING", "Pending")}</td>
                                    <td>
                                        <button type="button" class="primary-action-button save-single-mark-button" data-student-id="${escapeHtml(stu.id)}">Save</button>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("marksClassSelect")?.addEventListener("change", async event => {
        applicationState.facultySelectedClassId = /** @type {HTMLSelectElement} */ (event.target).value;
        await renderFacultyMarksSection(container);
    });
    document.getElementById("marksSubjectSelect")?.addEventListener("change", async event => {
        applicationState.facultySelectedSubject = /** @type {HTMLSelectElement} */ (event.target).value;
        await renderFacultyMarksSection(container);
    });
    document.getElementById("marksCategorySelect")?.addEventListener("change", async event => {
        applicationState.facultyAssessmentCategory = /** @type {HTMLSelectElement} */ (event.target).value;
        await renderFacultyMarksSection(container);
    });

    container.querySelectorAll(".save-single-mark-button").forEach(btn => {
        btn.addEventListener("click", async () => {
            const studentId = btn.getAttribute("data-student-id") || "";
            const input = /** @type {HTMLInputElement | null} */ (container.querySelector(`.student-marks-input[data-student-id="${studentId}"]`));
            const marksObtained = Number(input?.value ?? -1);
            if (Number.isNaN(marksObtained) || marksObtained < 0 || marksObtained > maxMarks) {
                showGlobalFeedback(`Invalid marks (${marksObtained}). Enter a score between 0 and ${maxMarks}.`, "negative");
                return;
            }
            try {
                await apiRequest("/api/assessments/mark", {
                    method: "POST",
                    body: JSON.stringify({
                        studentId,
                        classId: selectedClass?.id,
                        subject: applicationState.facultySelectedSubject,
                        category,
                        marksObtained,
                        maxMarks
                    })
                });
                await refreshSharedCatalog();
                showGlobalFeedback(`Saved ${category} marks (${marksObtained}/${maxMarks}) for ${studentId}.`);
                await renderFacultyMarksSection(container);
            } catch (err) {
                showGlobalFeedback(err instanceof Error ? err.message : "Failed to save marks.", "negative");
            }
        });
    });
}

async function renderClassReportSection(container) {
    const availableClasses = getFacultyClasses();
    if (!applicationState.facultySelectedClassId || !availableClasses.some(c => c.id === applicationState.facultySelectedClassId)) {
        applicationState.facultySelectedClassId = availableClasses[0]?.id || "CLS-CSE-2A";
    }
    const selectedClassId = applicationState.facultySelectedClassId;
    const report = await apiRequest(`/api/reports/class/${encodeURIComponent(selectedClassId)}`);
    applicationState.activeReport = report;
    const m = report.summaryMetrics || {};
    const chart = report.chartSeries || {};
    const isAdvisor = applicationState.currentUser?.role === "CLASS_ADVISOR";

    container.innerHTML = `
        <div class="cream-card-surface">
            <div class="section-header-bar">
                <div>
                    <h2 class="section-heading">${isAdvisor ? "Class Advisor Dashboard — " : ""}${escapeHtml(report.title)}</h2>
                    <p class="secondary-subtitle">${escapeHtml(report.subtitle)}</p>
                </div>
                <div class="action-toolbar no-print">
                    <select id="classReportSelect" class="cream-select-input" style="width:auto;">
                        ${availableClasses.map(c => `<option value="${escapeHtml(c.id)}" ${c.id === selectedClassId ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                    <button type="button" id="printClassReportButton" class="secondary-action-button">Print Report</button>
                    <button type="button" id="downloadClassCsvButton" class="primary-action-button">Download CSV</button>
                </div>
            </div>
        </div>

        <div class="summary-metrics-grid">
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Enrolled</span><span class="metric-value">${m.totalStudents ?? 0}</span><span class="metric-caption">Students in section</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Avg Attendance</span><span class="metric-value">${m.averageAttendance ?? 0}%</span><span class="metric-caption">${m.shortageCount ?? 0} shortage</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Mean Score</span><span class="metric-value">${m.averageMarks ?? 0}%</span><span class="metric-caption">Weighted assessment</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Class Topper</span><span class="metric-value">${m.topperScore ?? 0}%</span><span class="metric-caption">${escapeHtml(m.topperName)}</span></div>
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Subject-Wise Average Performance</h3>
            ${buildInlineSvgBarChart(chart.labels || [], chart.subjectAverages || [], null, "Subject Average %", "")}
        </div>

        <div class="two-column-grid">
            <div class="cream-card-surface">
                <h3 class="card-heading">Class Ranking Table</h3>
                <div class="responsive-table-wrapper">
                    <table class="academic-data-table">
                        <thead><tr><th>Rank</th><th>Roll No</th><th>Student</th><th>Attendance</th><th>Score</th><th>Grade</th></tr></thead>
                        <tbody>
                            ${(report.primaryRows || []).map(r => `
                                <tr>
                                    <td><strong>#${r.rank}</strong></td>
                                    <td>${escapeHtml(r.rollNumber)}</td>
                                    <td>${escapeHtml(r.studentName)}</td>
                                    <td>${r.attendancePercentage}%</td>
                                    <td>${r.academicPercentage}%</td>
                                    <td>${renderStatusBadge(r.grade === "F" ? "FAIL" : "PASS", r.grade)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="cream-card-surface">
                <h3 class="card-heading">Attendance Shortage List (&lt; 75%)</h3>
                ${(report.secondaryRows || []).length === 0
                    ? `<p class="secondary-subtitle">No students in this class are below the 75% threshold.</p>`
                    : `<div class="responsive-table-wrapper">
                        <table class="academic-data-table">
                            <thead><tr><th>Roll No</th><th>Student</th><th>Attendance</th><th>Deficit</th><th>Status</th></tr></thead>
                            <tbody>
                                ${(report.secondaryRows || []).map(s => `
                                    <tr>
                                        <td>${escapeHtml(s.rollNumber)}</td>
                                        <td>${escapeHtml(s.studentName)}</td>
                                        <td>${s.attendancePercentage}%</td>
                                        <td>-${s.deficitPercentage}%</td>
                                        <td>${renderStatusBadge("SHORTAGE", "Shortage")}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>`}
            </div>
        </div>

        <div class="cream-card-surface">
            <div class="report-thread-footer" style="margin-top:0;border-top:none;padding-top:0;">
                <span>${escapeHtml(report.remarks)}</span>
                <span><strong>Worker Thread:</strong> ${escapeHtml(report.generatedByThread)} | Strategy: ${escapeHtml(report.gradingStrategy)}</span>
            </div>
        </div>
    `;

    document.getElementById("classReportSelect")?.addEventListener("change", async event => {
        applicationState.facultySelectedClassId = /** @type {HTMLSelectElement} */ (event.target).value;
        await renderClassReportSection(container);
    });
    document.getElementById("printClassReportButton")?.addEventListener("click", () => window.print());
    document.getElementById("downloadClassCsvButton")?.addEventListener("click", () => {
        const rows = (report.primaryRows || []).map(r => [r.rank, r.rollNumber, r.studentName, r.attendancePercentage, r.academicPercentage, r.grade, r.eligibilityStatus]);
        downloadCsvFile(`class-report-${selectedClassId}.csv`, ["Rank", "Roll Number", "Name", "Attendance %", "Academic %", "Grade", "Status"], rows);
    });
}

/* ==================== STUDENT SECTIONS ==================== */

async function renderStudentOverviewSection(container) {
    const studentId = applicationState.currentUser?.id;
    if (!studentId) return;

    const [student, attendanceSummary, marksSummary] = await Promise.all([
        apiRequest(`/api/students/${encodeURIComponent(studentId)}`),
        apiRequest(`/api/attendance/student/${encodeURIComponent(studentId)}/summary`),
        apiRequest(`/api/assessments/student/${encodeURIComponent(studentId)}/summary`)
    ]);

    const lowAttendanceBanner = student.attendancePercentage < 75 ? `
        <div class="inline-feedback-banner warning-feedback-banner" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Low-Attendance Warning: Your cumulative attendance is ${Number(student.attendancePercentage).toFixed(1)}%, which is below the 75.0% minimum requirement.</span>
        </div>
    ` : "";

    const overallGrade = marksSummary.length > 0
        ? (student.academicPercentage >= 90 ? "A+" : student.academicPercentage >= 80 ? "A" : student.academicPercentage >= 70 ? "B+" : student.academicPercentage >= 60 ? "B" : student.academicPercentage >= 50 ? "C" : student.academicPercentage >= 40 ? "D" : "F")
        : "N/A";

    container.innerHTML = `
        ${lowAttendanceBanner}

        <div class="summary-metrics-grid">
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Roll Number</span><span class="metric-value">${escapeHtml(student.rollNumber)}</span><span class="metric-caption">${escapeHtml(student.classId)}</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Overall Attendance</span><span class="metric-value">${Number(student.attendancePercentage).toFixed(1)}%</span><span class="metric-caption">${student.attendancePercentage < 75 ? renderStatusBadge("SHORTAGE", "Below 75%") : renderStatusBadge("ELIGIBLE", "Eligible")}</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Weighted Score</span><span class="metric-value">${Number(student.academicPercentage).toFixed(1)}%</span><span class="metric-caption">Across ${marksSummary.length} subjects</span></div>
            <div class="cream-card-surface metric-summary-card"><span class="metric-label">Current Grade</span><span class="metric-value">${overallGrade}</span><span class="metric-caption">Based on active grading strategy</span></div>
        </div>

        <div class="two-column-grid">
            <div class="cream-card-surface">
                <h3 class="card-heading">Subject-Wise Attendance Summary</h3>
                <div class="responsive-table-wrapper">
                    <table class="academic-data-table">
                        <thead><tr><th>Subject</th><th>Present</th><th>Pending</th><th>Attendance %</th><th>Status</th></tr></thead>
                        <tbody>
                            ${attendanceSummary.map(row => `
                                <tr>
                                    <td><strong>${escapeHtml(row.subject)}</strong></td>
                                    <td>${row.present} / ${row.totalSessions}</td>
                                    <td>${row.pending}</td>
                                    <td>${row.percentage}%</td>
                                    <td>${row.shortage ? renderStatusBadge("SHORTAGE", "Shortage") : renderStatusBadge("PRESENT", "Eligible")}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="cream-card-surface">
                <h3 class="card-heading">Subject-Wise Assessment Breakdown</h3>
                <div class="responsive-table-wrapper">
                    <table class="academic-data-table">
                        <thead><tr><th>Subject</th><th>Internal (50)</th><th>Assign (25)</th><th>Lab (25)</th><th>Weighted %</th><th>Grade</th></tr></thead>
                        <tbody>
                            ${marksSummary.map(row => `
                                <tr>
                                    <td><strong>${escapeHtml(row.subject)}</strong></td>
                                    <td>${row.internalTestMarks}</td>
                                    <td>${row.assignmentMarks}</td>
                                    <td>${row.labRecordMarks}</td>
                                    <td>${row.weightedTotal}%</td>
                                    <td>${renderStatusBadge(row.grade === "F" ? "FAIL" : "PASS", row.grade)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function renderStudentReportSection(container) {
    const studentId = applicationState.currentUser?.id;
    if (!studentId) return;

    const report = await apiRequest(`/api/reports/student/${encodeURIComponent(studentId)}`);
    applicationState.activeReport = report;
    const m = report.summaryMetrics || {};
    const chart = report.chartSeries || {};

    container.innerHTML = `
        <div class="cream-card-surface">
            <div class="section-header-bar">
                <div>
                    <h2 class="section-heading">${escapeHtml(report.title)}</h2>
                    <p class="secondary-subtitle">${escapeHtml(report.subtitle)}</p>
                </div>
                <div class="action-toolbar no-print">
                    <button type="button" id="printStudentReportButton" class="secondary-action-button">Print Report</button>
                    <button type="button" id="downloadStudentCsvButton" class="primary-action-button">Download CSV</button>
                </div>
            </div>
        </div>

        ${m.lowAttendanceWarning ? `
            <div class="inline-feedback-banner warning-feedback-banner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Low Attendance Alert: ${m.attendancePercentage}% is below 75%. Please attend upcoming sessions regularly.</span>
            </div>
        ` : ""}

        <div class="two-column-grid">
            <div class="cream-card-surface">
                <h3 class="card-heading">Attendance &amp; Score by Subject</h3>
                ${buildInlineSvgBarChart(chart.labels || [], chart.attendance || [], chart.scores || [], "Attendance %", "Weighted Score %")}
            </div>
            <div class="cream-card-surface">
                <h3 class="card-heading">Internal Assessment Marks Trend</h3>
                ${buildInlineSvgTrendChart(report.secondaryRows || [])}
            </div>
        </div>

        <div class="cream-card-surface">
            <h3 class="card-heading">Subject Performance Transcript</h3>
            <div class="responsive-table-wrapper">
                <table class="academic-data-table">
                    <thead><tr><th>Subject</th><th>Sessions Attended</th><th>Attendance %</th><th>Weighted Score</th><th>Grade</th><th>Status</th></tr></thead>
                    <tbody>
                        ${(report.primaryRows || []).map(row => `
                            <tr>
                                <td><strong>${escapeHtml(row.subject)}</strong></td>
                                <td>${row.presentCount} / ${row.totalSessions}</td>
                                <td>${row.attendancePercentage}%</td>
                                <td>${row.weightedScore}%</td>
                                <td>${renderStatusBadge(row.grade === "F" ? "FAIL" : "PASS", row.grade)}</td>
                                <td>${row.attendanceStatus === "Shortage" ? renderStatusBadge("SHORTAGE", "Shortage") : renderStatusBadge("ELIGIBLE", "Eligible")}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
            <div class="report-thread-footer">
                <span><strong>Academic Remarks:</strong> ${escapeHtml(report.remarks)}</span>
                <span><strong>Worker Thread:</strong> ${escapeHtml(report.generatedByThread)} | Strategy: ${escapeHtml(report.gradingStrategy)}</span>
            </div>
        </div>
    `;

    document.getElementById("printStudentReportButton")?.addEventListener("click", () => window.print());
    document.getElementById("downloadStudentCsvButton")?.addEventListener("click", () => {
        const rows = (report.primaryRows || []).map(r => [r.subject, r.presentCount, r.totalSessions, r.attendancePercentage, r.weightedScore, r.grade, r.attendanceStatus]);
        downloadCsvFile(`student-report-${studentId}.csv`, ["Subject", "Present", "Total Sessions", "Attendance %", "Weighted Score %", "Grade", "Status"], rows);
    });
}

document.addEventListener("DOMContentLoaded", initializeLoginHandlers);
