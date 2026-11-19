package com.tracker.service;

import com.tracker.concurrent.AutoSaveDaemon;
import com.tracker.concurrent.ReportTaskExecutor;
import com.tracker.repository.DataStore;
import com.tracker.repository.JsonDataRepository;
import com.tracker.util.SeedDataGenerator;

// OOP: Plain Java Application Context wiring domain services and seed-versioned JSON storage
public final class TrackerContext {
    private static final TrackerContext INSTANCE = new TrackerContext();

    private final DataStore dataStore;
    private final JsonDataRepository repository;
    private final AutoSaveDaemon autoSaveDaemon;
    private final ReportTaskExecutor reportTaskExecutor;
    private final AcademicService academicService;
    private final AttendanceService attendanceService;
    private final ManagementService managementService;
    private final AuthService authService;
    private final ReportService reportService;

    private TrackerContext() {
        this.dataStore = new DataStore();
        this.repository = new JsonDataRepository();
        if (repository.hasCurrentVersionData()) {
            repository.loadAll(dataStore);
        } else {
            repository.clearStaleDataFiles();
            SeedDataGenerator.populateSeedData(dataStore);
            repository.saveAll(dataStore);
        }

        this.academicService = new AcademicService(dataStore);
        this.attendanceService = new AttendanceService(dataStore);
        this.managementService = new ManagementService(dataStore, academicService);
        this.authService = new AuthService(dataStore, academicService);
        this.reportTaskExecutor = new ReportTaskExecutor(4);
        this.reportService = new ReportService(dataStore, academicService, reportTaskExecutor);
        this.autoSaveDaemon = new AutoSaveDaemon(dataStore, repository);
        this.autoSaveDaemon.start();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            autoSaveDaemon.stopDaemon();
            reportTaskExecutor.shutdown();
        }, "tracker-shutdown-hook"));
    }

    public static TrackerContext getInstance() {
        return INSTANCE;
    }

    public DataStore getDataStore() {
        return dataStore;
    }

    public AcademicService getAcademicService() {
        return academicService;
    }

    public AttendanceService getAttendanceService() {
        return attendanceService;
    }

    public ManagementService getManagementService() {
        return managementService;
    }

    public AuthService getAuthService() {
        return authService;
    }

    public ReportService getReportService() {
        return reportService;
    }

    public AutoSaveDaemon getAutoSaveDaemon() {
        return autoSaveDaemon;
    }
}
