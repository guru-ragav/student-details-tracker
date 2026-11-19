package com.tracker.concurrent;

import com.tracker.repository.DataStore;
import com.tracker.repository.JsonDataRepository;

// OOP: Multithreading - Background Daemon Thread auto-saving data to JSON every 30 seconds
public class AutoSaveDaemon extends Thread {
    private static final long AUTO_SAVE_INTERVAL_MS = 30_000L;

    private final DataStore dataStore;
    private final JsonDataRepository repository;
    private volatile boolean running = true;

    public AutoSaveDaemon(DataStore dataStore, JsonDataRepository repository) {
        super("auto-save-daemon");
        this.dataStore = dataStore;
        this.repository = repository;
        // Daemon thread ensures JVM shuts down cleanly when main server exits
        setDaemon(true);
    }

    @Override
    public void run() {
        while (running) {
            try {
                Thread.sleep(AUTO_SAVE_INTERVAL_MS);
                if (running && dataStore.isDirty()) {
                    repository.saveAll(dataStore);
                }
            } catch (InterruptedException interruptedException) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception ignored) {
                // Keep daemon alive across transient IO issues
            }
        }
    }

    public void saveNow() {
        repository.saveAll(dataStore);
    }

    public void stopDaemon() {
        running = false;
        this.interrupt();
        if (dataStore.isDirty()) {
            repository.saveAll(dataStore);
        }
    }
}
