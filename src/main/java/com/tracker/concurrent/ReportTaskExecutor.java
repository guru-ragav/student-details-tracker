package com.tracker.concurrent;

import com.tracker.report.ReportData;
import com.tracker.report.Reportable;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

// OOP: Multithreading - ExecutorService thread pool + CompletableFuture parallel report generation
public class ReportTaskExecutor {
    private final ExecutorService executorService;

    public ReportTaskExecutor(int poolSize) {
        ThreadFactory namedFactory = new ThreadFactory() {
            private final AtomicInteger counter = new AtomicInteger(1);

            @Override
            public Thread newThread(Runnable runnable) {
                Thread thread = new Thread(runnable, "report-worker-" + counter.getAndIncrement());
                thread.setDaemon(true);
                return thread;
            }
        };
        this.executorService = Executors.newFixedThreadPool(poolSize, namedFactory);
    }

    public CompletableFuture<ReportData> submitReportAsync(Reportable reportable) {
        return CompletableFuture.supplyAsync(reportable::generate, executorService);
    }

    public CompletableFuture<List<ReportData>> generateAllParallel(List<Reportable> reports) {
        List<CompletableFuture<ReportData>> futures = new ArrayList<>();
        for (Reportable report : reports) {
            futures.add(submitReportAsync(report));
        }

        CompletableFuture<Void> allDone = CompletableFuture.allOf(
                futures.toArray(new CompletableFuture[0])
        );

        return allDone.thenApply(ignored -> {
            List<ReportData> results = new ArrayList<>();
            for (CompletableFuture<ReportData> future : futures) {
                results.add(future.join());
            }
            return results;
        });
    }

    public void shutdown() {
        executorService.shutdown();
    }
}
