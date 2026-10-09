
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
public class CCodeExecutor implements CodeExecutor {

    private static final int TIMEOUT_SECONDS = 30;
    private static final int MAX_OUTPUT_BYTES = 64 * 1024;

    private static final String CPU_LIMIT = "1";
    private static final String MEMORY_LIMIT = "256m";
    private static final String PID_LIMIT = "64";

    private static final String DOCKER_IMAGE = "codesprint-c-runner";

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

            tempDirectory = Files.createTempDirectory("codesprint-c-");

            Path sourceFile = tempDirectory.resolve("Main.c");

            Files.writeString(
                    sourceFile,
                    code,
                    StandardCharsets.UTF_8
            );

            // Compile C source code inside an isolated container.
            String compileContainerName =
                    createContainerName("codesprint-c-compile");

            ProcessBuilder compileBuilder = createDockerProcess(
                    compileContainerName,
                    tempDirectory,
                    false,
                    "gcc",
                    "-std=c11",
                    "-O2",
                    "-pipe",
                    "Main.c",
                    "-o",
                    "Main"
            );

            DockerExecutionResult compileResult =
                    runDockerWithLimitedOutput(
                            compileBuilder,
                            compileContainerName
                    );

            if (compileResult.timedOut) {
                return new RunCodeResponse(
                        false,
                        "Time Limit Exceeded",
                        null,
                        "Compilation exceeded the time limit"
                );
            }

            if (compileResult.outputExceeded) {
                return new RunCodeResponse(
                        false,
                        "Compilation Error",
                        null,
                        "Compiler output exceeded the maximum allowed size"
                );
            }

            if (compileResult.exitCode != 0) {
                String compileOutput = compileResult.output.trim();

                return new RunCodeResponse(
                        false,
                        "Compilation Error",
                        null,
                        compileOutput.isEmpty()
                                ? "C compilation failed"
                                : compileOutput
                );
            }

            StringBuilder outputBuilder = new StringBuilder();

            int passedTestCases = 0;
            int failedTestCases = 0;
            int totalTestCases = testCases.size();

            // Execute each test case in a fresh container.
            for (int i = 0; i < testCases.size(); i++) {

                TestCase testCase = testCases.get(i);

                String testInput = testCase.getInput() == null
                        ? ""
                        : testCase.getInput();

                Path inputFile = tempDirectory.resolve("input.txt");

                Files.writeString(
                        inputFile,
                        testInput,
                        StandardCharsets.UTF_8
                );

                String runContainerName =
                        createContainerName("codesprint-c-run");

                // The compiled executable is readable, but the
                // submitted program cannot modify the host workspace.
                ProcessBuilder runBuilder = createDockerProcess(
                        runContainerName,
                        tempDirectory,
                        true,
                        "./Main"
                );

                runBuilder.redirectInput(inputFile.toFile());

                DockerExecutionResult runResult =
                        runDockerWithLimitedOutput(
                                runBuilder,
                                runContainerName
                        );

                if (runResult.timedOut) {
                    return new RunCodeResponse(
                            false,
                            "Time Limit Exceeded",
                            null,
                            "Test case " + (i + 1)
                                    + " exceeded the time limit"
                    );
                }

                if (runResult.outputExceeded) {
                    return new RunCodeResponse(
                            false,
                            "Output Limit Exceeded",
                            null,
                            "Test case " + (i + 1)
                                    + " produced too much output"
                    );
                }

                String output = runResult.output.trim();

                if (runResult.exitCode != 0) {
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

                    outputBuilder.append("Test Case ")
                            .append(i + 1)
                            .append(": Passed\n");
                } else {
                    failedTestCases++;

                    outputBuilder.append("Test Case ")
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
                    outputBuilder.toString().trim(),
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
                    "Unable to execute C code"
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
            boolean readOnlyWorkspace,
            String... command) {

        List<String> dockerCommand = new ArrayList<>();

        dockerCommand.add("docker");
        dockerCommand.add("run");
        dockerCommand.add("--rm");

        dockerCommand.add("--name");
        dockerCommand.add(containerName);

        // Standard input is used for test-case input.
        dockerCommand.add("-i");

        // Disable network access.
        dockerCommand.add("--network");
        dockerCommand.add("none");

        // Make the container's root filesystem read-only.
        dockerCommand.add("--read-only");

        // Remove Linux capabilities.
        dockerCommand.add("--cap-drop");
        dockerCommand.add("ALL");

        // Prevent privilege escalation.
        dockerCommand.add("--security-opt");
        dockerCommand.add("no-new-privileges");

        // Resource limits.
        dockerCommand.add("--pids-limit");
        dockerCommand.add(PID_LIMIT);

        dockerCommand.add("--cpus");
        dockerCommand.add(CPU_LIMIT);

        dockerCommand.add("--memory");
        dockerCommand.add(MEMORY_LIMIT);

        // Controlled writable temporary storage.
        dockerCommand.add("--tmpfs");
        dockerCommand.add(
                "/tmp:rw,nosuid,nodev,size=64m,uid=10001,gid=10001"
        );

        // Run as an unprivileged user.
        dockerCommand.add("--user");
        dockerCommand.add("10001:10001");

        // Compilation needs a writable workspace for Main.
        // Runtime uses a read-only workspace.
        dockerCommand.add("-v");
        dockerCommand.add(
                tempDirectory.toAbsolutePath()
                        + (readOnlyWorkspace ? ":/app:ro" : ":/app")
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
                new ByteArrayOutputStream(MAX_OUTPUT_BYTES);

        AtomicBoolean outputExceeded = new AtomicBoolean(false);

        // Continuously drain output, retaining at most 64 KB.
        Thread outputReader = new Thread(() -> {
            try (InputStream inputStream = process.getInputStream()) {

                byte[] buffer = new byte[4096];
                int bytesRead;

                while ((bytesRead = inputStream.read(buffer)) != -1) {

                    synchronized (capturedOutput) {
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
                }

            } catch (IOException ignored) {
                // Stream may close during container cleanup.
            }
        }, "codesprint-c-output-reader");

        outputReader.setDaemon(true);
        outputReader.start();

        long deadline = System.nanoTime()
                + TimeUnit.SECONDS.toNanos(TIMEOUT_SECONDS);

        boolean timedOut = false;

        try {
            while (process.isAlive()) {

                // Stop execution promptly if output exceeds the limit.
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

        String output;

        synchronized (capturedOutput) {
            output = new String(
                    capturedOutput.toByteArray(),
                    StandardCharsets.UTF_8
            );
        }

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
