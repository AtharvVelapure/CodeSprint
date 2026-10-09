
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
public class JavaCodeExecutor implements CodeExecutor {

    private static final int TIMEOUT_SECONDS = 30;
    private static final int MAX_OUTPUT_BYTES = 64 * 1024;

    private static final String CPU_LIMIT = "1";
    private static final String MEMORY_LIMIT = "256m";
    private static final String PID_LIMIT = "64";

    private static final String DOCKER_IMAGE = "codesprint-java-runner";

    @Override
    public RunCodeResponse execute(
            String code,
            List<TestCase> testCases) {

        Path tempDirectory = null;

        try {
            if (code == null || code.isBlank()) {
                return error(
                        "Execution Error",
                        "Source code cannot be empty");
            }

            if (testCases == null || testCases.isEmpty()) {
                return error(
                        "Execution Error",
                        "No test cases available");
            }

            tempDirectory = Files.createTempDirectory("codesprint-java-");

            Path javaFile = tempDirectory.resolve("Main.java");
            Files.writeString(javaFile, code, StandardCharsets.UTF_8);

            // Compile Java source.
            String compileContainer = createContainerName(
                    "codesprint-java-compile");

            ProcessBuilder compileBuilder = createDockerProcess(
                    compileContainer,
                    tempDirectory,
                    "javac",
                    "Main.java");

            compileBuilder.redirectErrorStream(true);

            DockerExecutionResult compileResult =
                    runDockerWithLimitedOutput(
                            compileBuilder,
                            compileContainer);

            if (compileResult.timedOut) {
                return error(
                        "Time Limit Exceeded",
                        "Compilation exceeded the time limit");
            }

            if (compileResult.outputExceeded) {
                return error(
                        "Output Limit Exceeded",
                        "Compiler output exceeded the maximum allowed size");
            }

            if (compileResult.exitCode != 0) {
                return error(
                        "Compilation Error",
                        compileResult.output);
            }

            Path inputFile = tempDirectory.resolve("input.txt");

            StringBuilder allOutputs = new StringBuilder();
            int passedTestCases = 0;
            int failedTestCases = 0;
            int totalTestCases = testCases.size();

            // Run each test case in a separate container.
            for (int i = 0; i < testCases.size(); i++) {

                TestCase testCase = testCases.get(i);

                String testInput = testCase.getInput() == null
                        ? ""
                        : testCase.getInput();

                Files.writeString(
                        inputFile,
                        testInput,
                        StandardCharsets.UTF_8);

                String runContainer = createContainerName(
                        "codesprint-java-run");

                ProcessBuilder runBuilder = createDockerProcess(
                        runContainer,
                        tempDirectory,
                        "java",
                        "Main");

                runBuilder.redirectInput(inputFile.toFile());
                runBuilder.redirectErrorStream(true);

                DockerExecutionResult runResult =
                        runDockerWithLimitedOutput(
                                runBuilder,
                                runContainer);

                if (runResult.timedOut) {
                    return error(
                            "Time Limit Exceeded",
                            "Test case " + (i + 1)
                                    + " exceeded the time limit");
                }

                if (runResult.outputExceeded) {
                    return error(
                            "Output Limit Exceeded",
                            "Test case " + (i + 1)
                                    + " exceeded the output limit");
                }

                String output = runResult.output.trim();

                if (runResult.exitCode != 0) {
                    return error(
                            "Runtime Error",
                            "Test case " + (i + 1)
                                    + " failed:\n" + output);
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

            return new RunCodeResponse(
                    allPassed,
                    allPassed ? "Accepted" : "Wrong Answer",
                    allOutputs.toString().trim(),
                    null,
                    passedTestCases,
                    failedTestCases,
                    totalTestCases);

        } catch (IOException e) {
            return error(
                    "Execution Error",
                    "Unable to execute Java code");

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();

            return error(
                    "Execution Interrupted",
                    "Code execution was interrupted");

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

        dockerCommand.add("-i");

        dockerCommand.add("--network");
        dockerCommand.add("none");

        dockerCommand.add("--read-only");

        dockerCommand.add("--cap-drop");
        dockerCommand.add("ALL");

        dockerCommand.add("--security-opt");
        dockerCommand.add("no-new-privileges");

        dockerCommand.add("--pids-limit");
        dockerCommand.add(PID_LIMIT);

        dockerCommand.add("--cpus");
        dockerCommand.add(CPU_LIMIT);

        dockerCommand.add("--memory");
        dockerCommand.add(MEMORY_LIMIT);

        dockerCommand.add("--user");
        dockerCommand.add("10001:10001");

        dockerCommand.add("--tmpfs");
        dockerCommand.add(
                "/tmp:rw,nosuid,nodev,size=64m,uid=10001,gid=10001");

        dockerCommand.add("-v");
        dockerCommand.add(
                tempDirectory.toAbsolutePath() + ":/app");

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

        Process process = builder.start();

        ByteArrayOutputStream captured =
                new ByteArrayOutputStream(MAX_OUTPUT_BYTES);

        AtomicBoolean outputExceeded = new AtomicBoolean(false);

        Thread outputReader = new Thread(() -> {
            try (InputStream input = process.getInputStream()) {

                byte[] buffer = new byte[4096];
                int count;

                while ((count = input.read(buffer)) != -1) {

                    synchronized (captured) {
                        int remaining =
                                MAX_OUTPUT_BYTES - captured.size();

                        int toStore = Math.min(count, remaining);

                        if (toStore > 0) {
                            captured.write(buffer, 0, toStore);
                        }

                        if (count > remaining) {
                            outputExceeded.set(true);
                            break;
                        }
                    }
                }

            } catch (IOException ignored) {
                // The process may close its output stream during cleanup.
            }
        }, "codesprint-output-reader");

        outputReader.setDaemon(true);
        outputReader.start();

        boolean finished;

        try {
            finished = process.waitFor(
                    TIMEOUT_SECONDS,
                    TimeUnit.SECONDS);

        } catch (InterruptedException e) {
            stopDockerContainer(containerName, process);
            Thread.currentThread().interrupt();
            throw e;
        }

        if (!finished || outputExceeded.get()) {
            stopDockerContainer(containerName, process);
        }

        outputReader.join(2000);

        String output;

        synchronized (captured) {
            output = captured.toString(StandardCharsets.UTF_8);
        }

        int exitCode = -1;

        if (!process.isAlive()) {
            exitCode = process.exitValue();
        }

        return new DockerExecutionResult(
                !finished,
                outputExceeded.get(),
                exitCode,
                output);
    }

    private void stopDockerContainer(
            String containerName,
            Process dockerProcess) {

        if (dockerProcess != null && dockerProcess.isAlive()) {
            dockerProcess.destroy();

            try {
                if (!dockerProcess.waitFor(2, TimeUnit.SECONDS)) {
                    dockerProcess.destroyForcibly();
                }
            } catch (InterruptedException e) {
                dockerProcess.destroyForcibly();
                Thread.currentThread().interrupt();
            }
        }

        try {
            Process removeProcess = new ProcessBuilder(
                    "docker",
                    "rm",
                    "-f",
                    containerName)
                    .start();

            if (!removeProcess.waitFor(5, TimeUnit.SECONDS)) {
                removeProcess.destroyForcibly();
            }

        } catch (IOException e) {
            // Cleanup failure should be logged in production.

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String createContainerName(String prefix) {
        return prefix + "-"
                + UUID.randomUUID().toString().replace("-", "");
    }

    private RunCodeResponse error(
            String status,
            String message) {

        return new RunCodeResponse(
                false,
                status,
                null,
                message);
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
                            // Cleanup failure should be logged in production.
                        }
                    });

        } catch (IOException ignored) {
            // Cleanup failure should be logged in production.
        }
    }

    private static final class DockerExecutionResult {

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