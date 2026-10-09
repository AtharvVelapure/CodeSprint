package com.Av.Online.Coding.Practice.Platform.security;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class CodeExecutionRateLimiter {

    private final ConcurrentHashMap<String, Deque<Long>> requests =
            new ConcurrentHashMap<>();

    public boolean allowRequest(
            Long userId,
            String action,
            int maxRequests,
            Duration window) {

        if (userId == null) {
            return false;
        }

        String key = userId + ":" + action;

        Deque<Long> timestamps =
                requests.computeIfAbsent(
                        key,
                        ignored -> new ArrayDeque<>()
                );

        synchronized (timestamps) {
            long now = System.nanoTime();
            long windowNanos = window.toNanos();

            while (!timestamps.isEmpty()
                    && now - timestamps.peekFirst() >= windowNanos) {
                timestamps.removeFirst();
            }

            if (timestamps.size() >= maxRequests) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }
}
