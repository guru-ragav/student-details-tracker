package com.tracker;

import com.tracker.service.TrackerContext;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TrackerApplication {
    public static void main(String[] args) {
        // Initialize plain Java domain context, seed/load JSON data, and start background AutoSaveDaemon
        TrackerContext.getInstance();
        SpringApplication.run(TrackerApplication.class, args);
    }
}
