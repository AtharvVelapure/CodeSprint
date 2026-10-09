package com.Av.Online.Coding.Practice.Platform.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.entity.User;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class JwtService {

    private final byte[] secret;
    private final long expirationSeconds;
    private final JsonMapper jsonMapper;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-seconds:86400}") long expirationSeconds,
            JsonMapper jsonMapper) {

        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT secret must contain at least 32 characters");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationSeconds;
        this.jsonMapper = jsonMapper;
    }

    public String generateToken(User user) {
        try {
            long now = Instant.now().getEpochSecond();
            String header = base64Url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
            String payloadJson = "{\"sub\":\"" + user.getId() +
                    "\",\"email\":\"" + escape(user.getEmail()) +
                    "\",\"role\":\"" + user.getRole().name() +
                    "\",\"iat\":" + now +
                    ",\"exp\":" + (now + expirationSeconds) + "}";
            String payload = base64Url(payloadJson);
            String unsigned = header + "." + payload;
            return unsigned + "." + sign(unsigned);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not create authentication token", exception);
        }
    }

    public JwtClaims validateAndParse(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            String unsigned = parts[0] + "." + parts[1];
            if (!constantTimeEquals(sign(unsigned), parts[2])) return null;
            String json = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JsonNode node = jsonMapper.readTree(json);
            long exp = node.path("exp").asLong(0);
            if (exp <= Instant.now().getEpochSecond()) return null;
            Long userId = Long.valueOf(node.path("sub").asText());
            String email = node.path("email").asText();
            String role = node.path("role").asText();
            if (email.isBlank() || role.isBlank()) return null;
            return new JwtClaims(userId, email, role);
        } catch (Exception exception) {
            return null;
        }
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    private String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private boolean constantTimeEquals(String left, String right) {
        return java.security.MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8));
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public record JwtClaims(Long userId, String email, String role) {}
}
