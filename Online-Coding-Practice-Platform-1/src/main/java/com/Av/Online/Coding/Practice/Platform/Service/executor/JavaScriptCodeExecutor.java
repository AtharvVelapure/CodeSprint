
package com.Av.Online.Coding.Practice.Platform.Service.executor;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.stereotype.Component;

import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;
import com.Av.Online.Coding.Practice.Platform.entity.TestCase;

@Component
public class JavaScriptCodeExecutor implements CodeExecutor {

    private static final int TIMEOUT_SECONDS = 30;
    private static final int MAX_OUTPUT_BYTES = 64 * 1024;

    private static final String CPU_LIMIT = "1";
    private static final String MEMORY_LIMIT = "256m";
    private static final String PID_LIMIT = "64";

    private static final String DOCKER_IMAGE =
            "codesprint-javascript-runner";

    @Override
    public RunCodeResponse execute(
            String code,
            List<TestCase> testCases) {

        Path tempDirectory = null;

        try {
            if (code == null || code.isBlank()) {
                return new RunCodeResponse(
                        false,
                        "Execution Error",
                        null,
                        "Source code cannot be empty"
                );
            }

            if (testCases == null || testCases.isEmpty()) {
                return new RunCodeResponse(
                        false,
                        "Execution Error",
                        null,
                        "No test cases available"
                );
            }

            tempDirectory = Files.createTempDirectory(
                    "codesprint-javascript-"
            );

            Path javascriptFile =
                    tempDirectory.resolve("Main.js");

            Files.writeString(
                    javascriptFile,
                    code,
                    StandardCharsets.UTF_8
            );

            StringBuilder allOutputs = new StringBuilder();

            int passedTestCases = 0;
            int failedTestCases = 0;
            int totalTestCases = testCases.size();

            // Run each test case in a fresh isolated container.
            for (int i = 0; i < testCases.size(); i++) {

                TestCase testCase = testCases.get(i);

                String testInput = testCase.getInput() == null
                        ? ""
                        : testCase.getInput();

                Path inputFile =
                        tempDirectory.resolve("input.txt");

                Files.writeString(
                        inputFile,
                        testInput,
                        StandardCharsets.UTF_8
                );

                String containerName =
                        createContainerName(
                                "codesprint-javascript-run"
                        );

                ProcessBuilder runBuilder = createDockerProcess(
                        containerName,
                        tempDirectory,
                        "node",
                        "Main.js"
                );

                runBuilder.redirectInput(inputFile.toFile());

                DockerExecutionResult result =
                        runDockerWithLimitedOutput(
                                runBuilder,
                                containerName
                        );

                if (result.timedOut) {
                    return new RunCodeResponse(
                            false,
                            "Time Limit Exceeded",
                            null,
                            "Test case " + (i + 1)
                                    + " exceeded the time limit"
                    );
                }

                if (result.outputExceeded) {
                    return new RunCodeResponse(
                            false,
                            "Output Limit Exceeded",
                            null,
                            "Test case " + (i + 1)
                                    + " produced too much output"
                    );
                }

                String output = result.output.trim();

                if (result.exitCode != 0) {
                    return new RunCodeResponse(
                            false,
                            "Runtime Error",
                            null,
                            "Test case " + (i + 1)
                                    + " failed:\n" + output
                    );
                }

                String expectedOutput =
                        testCase.getExpectedOutput() == null
                                ? ""
                                : testCase.getExpectedOutput().trim();

                if (output.equals(expectedOutput)) {
                    passedTestCases++;

                    allOutputs.append("Test Case ")
                            .append(i + 1)
                            .append(": Passed\n");
                } else {
                    failedTestCases++;

                    allOutputs.append("Test Case ")
                            .append(i + 1)
                            .append(": Failed\n");
                }
            }

            boolean allPassed = failedTestCases == 0;

            String status = allPassed
                    ? "Accepted"
                    : "Wrong Answer";

            return new RunCodeResponse(
                    allPassed,
                    status,
                    allOutputs.toString().trim(),
                    null,
                    passedTestCases,
                    failedTestCases,
                    totalTestCases
            );

        } catch (IOException e) {
            return new RunCodeResponse(
                    false,
                    "Execution Error",
                    null,
                    "Unable to execute JavaScript code"
            );

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();

            return new RunCodeResponse(
                    false,
                    "Execution Interrupted",
                    null,
                    "Code execution was interrupted"
            );

        } finally {
            deleteTemporaryDirectory(tempDirectory);
        }
    }

    private ProcessBuilder createDockerProcess(
            String containerName,
            Path tempDirectory,
            String... command) {

        List<String> dockerCommand = new ArrayList<>();

        dockerCommand.add("docker");
        dockerCommand.add("run");
        dockerCommand.add("--rm");

        dockerCommand.add("--name");
        dockerCommand.add(containerName);

        // Supply test input through standard input.
        dockerCommand.add("-i");

        // Disable network access.
        dockerCommand.add("--network");
        dockerCommand.add("none");

        // Restrict container filesystem and privileges.
        dockerCommand.add("--read-only");

        dockerCommand.add("--cap-drop");
        dockerCommand.add("ALL");

        dockerCommand.add("--security-opt");
        dockerCommand.add("no-new-privileges");

        // Resource limits.
        dockerCommand.add("--pids-limit");
        dockerCommand.add(PID_LIMIT);

        dockerCommand.add("--cpus");
        dockerCommand.add(CPU_LIMIT);

        dockerCommand.add("--memory");
        dockerCommand.add(MEMORY_LIMIT);

        // Controlled writable temporary storage for Node.js.
        dockerCommand.add("--tmpfs");
        dockerCommand.add(
                "/tmp:rw,nosuid,nodev,size=64m,uid=10001,gid=10001"
        );

        // Run submitted code as a non-root user.
        dockerCommand.add("--user");
        dockerCommand.add("10001:10001");

        // Mount only the temporary CodeSprint workspace.
        dockerCommand.add("-v");
        dockerCommand.add(
                tempDirectory.toAbsolutePath() + ":/app"
        );

        dockerCommand.add("--workdir");
        dockerCommand.add("/app");

        dockerCommand.add(DOCKER_IMAGE);

        for (String argument : command) {
            dockerCommand.add(argument);
        }

        return new ProcessBuilder(dockerCommand);
    }

    private DockerExecutionResult runDockerWithLimitedOutput(
            ProcessBuilder builder,
            String containerName)
            throws IOException, InterruptedException {

        builder.redirectErrorStream(true);

        Process process = builder.start();

        ByteArrayOutputStream capturedOutput =
                new ByteArrayOutputStream();

        AtomicBoolean outputExceeded = new AtomicBoolean(false);

        /*
         * Drain all output to avoid blocking the Docker process.
         * Store no more than MAX_OUTPUT_BYTES in application memory.
         */
        Thread outputReader = new Thread(() -> {
            try (InputStream inputStream = process.getInputStream()) {

                byte[] buffer = new byte[4096];
                int bytesRead;

                while ((bytesRead = inputStream.read(buffer)) != -1) {

                    int remaining =
                            MAX_OUTPUT_BYTES - capturedOutput.size();

                    int bytesToKeep = Math.min(
                            bytesRead,
                            Math.max(remaining, 0)
                    );

                    if (bytesToKeep > 0) {
                        capturedOutput.write(
                                buffer,
                                0,
                                bytesToKeep
                        );
                    }

                    if (bytesRead > bytesToKeep) {
                        outputExceeded.set(true);
                    }
                }

            } catch (IOException ignored) {
                // The stream may close during container cleanup.
            }
        }, "codesprint-javascript-output-reader");

        outputReader.setDaemon(true);
        outputReader.start();

        long deadline = System.nanoTime()
                + TimeUnit.SECONDS.toNanos(TIMEOUT_SECONDS);

        boolean timedOut = false;

        try {
            while (process.isAlive()) {

                // Stop promptly when output exceeds the allowed limit.
                if (outputExceeded.get()) {
                    stopDockerContainer(containerName, process);
                    break;
                }

                long remainingNanos =
                        deadline - System.nanoTime();

                if (remainingNanos <= 0) {
                    timedOut = process.isAlive();

                    if (timedOut) {
                        stopDockerContainer(
                                containerName,
                                process
                        );
                    }

                    break;
                }

                process.waitFor(
                        Math.min(
                                100,
                                Math.max(
                                        1,
                                        TimeUnit.NANOSECONDS.toMillis(
                                                remainingNanos
                                        )
                                )
                        ),
                        TimeUnit.MILLISECONDS
                );
            }

        } catch (InterruptedException e) {
            stopDockerContainer(containerName, process);
            throw e;
        }

        outputReader.join(2000);

        String output = new String(
                capturedOutput.toByteArray(),
                StandardCharsets.UTF_8
        );

        int exitCode = process.isAlive()
                ? -1
                : process.exitValue();

        return new DockerExecutionResult(
                timedOut,
                outputExceeded.get(),
                exitCode,
                output
        );
    }

    private String createContainerName(String prefix) {
        return prefix + "-"
                + UUID.randomUUID()
                        .toString()
                        .replace("-", "");
    }

    private void stopDockerContainer(
            String containerName,
            Process dockerProcess) {

        if (dockerProcess != null && dockerProcess.isAlive()) {
            dockerProcess.destroy();

            try {
                if (!dockerProcess.waitFor(
                        2,
                        TimeUnit.SECONDS)) {
                    dockerProcess.destroyForcibly();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                dockerProcess.destroyForcibly();
            }
        }

        // Force-remove the container if it still exists.
        try {
            Process removeProcess = new ProcessBuilder(
                    "docker",
                    "rm",
                    "-f",
                    containerName
            ).start();

            if (!removeProcess.waitFor(
                    5,
                    TimeUnit.SECONDS)) {
                removeProcess.destroyForcibly();
            }

        } catch (IOException ignored) {
            // Best-effort container cleanup.
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void deleteTemporaryDirectory(Path tempDirectory) {

        if (tempDirectory == null || !Files.exists(tempDirectory)) {
            return;
        }

        try (var paths = Files.walk(tempDirectory)) {
            paths.sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                            // Best-effort temporary-file cleanup.
                        }
                    });
        } catch (IOException ignored) {
            // Best-effort temporary-directory cleanup.
        }
    }

    private static class DockerExecutionResult {

        private final boolean timedOut;
        private final boolean outputExceeded;
        private final int exitCode;
        private final String output;

        private DockerExecutionResult(
                boolean timedOut,
                boolean outputExceeded,
                int exitCode,
                String output) {

            this.timedOut = timedOut;
            this.outputExceeded = outputExceeded;
            this.exitCode = exitCode;
            this.output = output;
        }
    }
}
