package com.Av.Online.Coding.Practice.Platform.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;

@Service
public class AssessmentDocumentStorageService {

    private final Path uploadDirectory;

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("pdf", "jpg", "jpeg", "png");

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "application/pdf",
                    "image/jpeg",
                    "image/png"
            );

    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;

    public AssessmentDocumentStorageService(
            @Value("${assessment.upload.directory}")
            String uploadDirectory) {

        if (uploadDirectory == null
                || uploadDirectory.isBlank()) {

            throw new IllegalStateException(
                    "Assessment upload directory is not configured"
            );
        }

        this.uploadDirectory =
                Paths.get(uploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        try {

            Files.createDirectories(
                    this.uploadDirectory
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Could not create assessment upload directory: "
                            + this.uploadDirectory,
                    exception
            );
        }
    }

    /**
     * Stores a new verification document.
     *
     * IMPORTANT:
     * Only the generated filename is returned.
     * We do NOT store the machine-specific absolute
     * filesystem path in the database.
     */
    public String storeDocument(
            MultipartFile document) {

        validateDocument(document);

        String originalFilename =
                document.getOriginalFilename();

        String extension =
                getExtension(originalFilename);

        String uniqueFilename =
                UUID.randomUUID()
                        + "."
                        + extension;

        Path targetPath =
                resolveNewDocumentPath(uniqueFilename);

        try (InputStream inputStream =
                     document.getInputStream()) {

            Files.copy(
                    inputStream,
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Could not store assessment document",
                    exception
            );
        }

        return uniqueFilename;
    }

    /**
     * Resolves a document path stored in the database.
     *
     * Supports BOTH:
     *
     * 1. New format:
     *    abc-uuid.png
     *
     * 2. Old format:
     *    D:\old-project/uploads\assessment-verification\abc-uuid.png
     *
     * This backward compatibility is important because
     * existing database records currently contain
     * absolute Windows paths.
     */
    public Path resolveDocumentPath(
            String storedDocumentPath) {

        if (storedDocumentPath == null
                || storedDocumentPath.isBlank()) {

            throw new BadRequestException(
                    "Verification document path is missing"
            );
        }

        String trimmedPath =
                storedDocumentPath.trim();

        Path storedPath;

        try {

            storedPath =
                    Paths.get(trimmedPath)
                            .normalize();

        } catch (Exception exception) {

            throw new BadRequestException(
                    "Invalid verification document path"
            );
        }

        /*
         * BACKWARD COMPATIBILITY
         *
         * If the database contains an absolute path,
         * use it only if it still exists.
         *
         * This allows existing documents that were
         * uploaded before this fix to continue working.
         */
        if (storedPath.isAbsolute()) {

            Path absolutePath =
                    storedPath.toAbsolutePath()
                            .normalize();

            if (Files.exists(absolutePath)
                    && Files.isRegularFile(absolutePath)) {

                return absolutePath;
            }

            /*
             * The old absolute path may no longer be valid
             * because the project was moved.
             *
             * Try the filename inside the current
             * configured upload directory.
             */
            Path fileName =
                    absolutePath.getFileName();

            if (fileName != null) {

                Path migratedPath =
                        resolveSafePath(
                                fileName.toString()
                        );

                if (Files.exists(migratedPath)
                        && Files.isRegularFile(migratedPath)) {

                    return migratedPath;
                }
            }

            /*
             * Return the old path so the caller can
             * produce a proper "document does not exist"
             * response.
             */
            return absolutePath;
        }

        /*
         * NEW FORMAT
         *
         * Database contains only a filename or
         * relative path.
         */
        return resolveSafePath(
                trimmedPath
        );
    }

    /**
     * Resolves a newly stored filename safely inside
     * the configured upload directory.
     */
    private Path resolveNewDocumentPath(
            String filename) {

        return resolveSafePath(filename);
    }

    /**
     * Prevents path traversal.
     */
    private Path resolveSafePath(
            String relativePath) {

        Path resolvedPath =
                uploadDirectory
                        .resolve(relativePath)
                        .normalize();

        if (!resolvedPath.startsWith(
                uploadDirectory)) {

            throw new BadRequestException(
                    "Invalid verification document path"
            );
        }

        return resolvedPath;
    }

    private void validateDocument(
            MultipartFile document) {

        if (document == null
                || document.isEmpty()) {

            throw new BadRequestException(
                    "Business verification document is required"
            );
        }

        if (document.getSize() > MAX_FILE_SIZE) {

            throw new BadRequestException(
                    "Document size cannot exceed 10 MB"
            );
        }

        String originalFilename =
                document.getOriginalFilename();

        if (originalFilename == null
                || originalFilename.isBlank()) {

            throw new BadRequestException(
                    "Invalid document name"
            );
        }

        String extension =
                getExtension(originalFilename);

        if (!ALLOWED_EXTENSIONS.contains(
                extension)) {

            throw new BadRequestException(
                    "Invalid document type. "
                            + "Only PDF, JPG, JPEG and PNG are allowed"
            );
        }

        String contentType =
                document.getContentType();

        if (contentType == null
                || !ALLOWED_CONTENT_TYPES.contains(
                        contentType)) {

            throw new BadRequestException(
                    "Invalid document content type"
            );
        }
    }

    private String getExtension(
            String filename) {

        int lastDot =
                filename.lastIndexOf('.');

        if (lastDot == -1
                || lastDot == filename.length() - 1) {

            throw new BadRequestException(
                    "File extension is required"
            );
        }

        return filename
                .substring(lastDot + 1)
                .toLowerCase();
    }
}