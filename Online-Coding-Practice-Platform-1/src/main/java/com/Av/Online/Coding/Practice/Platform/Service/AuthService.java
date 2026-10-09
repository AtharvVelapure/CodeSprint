package com.Av.Online.Coding.Practice.Platform.Service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.UpdateProfileRequest;
import com.Av.Online.Coding.Practice.Platform.dto.LoginRequest;
import com.Av.Online.Coding.Practice.Platform.dto.RegisterRequest;
import com.Av.Online.Coding.Practice.Platform.dto.UserProfileRequest;
import com.Av.Online.Coding.Practice.Platform.dto.UserResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Role;
import com.Av.Online.Coding.Practice.Platform.entity.User;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;
import com.Av.Online.Coding.Practice.Platform.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    // ================================
    // USER REGISTRATION
    // ================================

    public String registerUser(RegisterRequest request) {

        if (request == null) {
            throw new BadRequestException("Invalid registration request");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("Name is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new BadRequestException("Password must contain at least 8 characters");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        userRepository.save(user);

        return "Registration successful";
    }


    // ================================
    // USER LOGIN
    // ================================

    public UserResponse loginUser(LoginRequest request) {

        if (request == null
                || request.getEmail() == null
                || request.getEmail().trim().isEmpty()
                || request.getPassword() == null
                || request.getPassword().isEmpty()) {
            throw new BadRequestException("Email and password are required");
        }

        User user = userRepository
                .findByEmail(request.getEmail().trim().toLowerCase())
                .orElse(null);

        if (user == null) {
            throw new ResourceNotFoundException("Email not found");
        }

        if (!user.isActive()) {
            throw new ForbiddenException("Account is blocked");
        }

        String storedPassword = user.getPassword();
        boolean bcryptPassword = storedPassword != null && storedPassword.startsWith("$2");
        boolean passwordMatches = bcryptPassword
                ? passwordEncoder.matches(request.getPassword(), storedPassword)
                : storedPassword != null && storedPassword.equals(request.getPassword());

        if (!passwordMatches) {
            throw new ForbiddenException("Invalid password");
        }

        // Transparently upgrade legacy plaintext passwords after a successful login.
        if (!bcryptPassword) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
        }

        UserResponse response = new UserResponse(user);
        response.setToken(jwtService.generateToken(user));
        return response;
    }
    
 // ================================
 // GET USER PROFILE
 // ================================

 public UserResponse getUserProfile(Long userId) {

     User user = userRepository.findById(userId)
             .orElseThrow(() ->
                     new ResourceNotFoundException("User not found"));

     return new UserResponse(user);
 }


	//================================
	//UPDATE PROFILE + PASSWORD
	//================================
	
	public String updateUserProfile(
	      Long userId,
	      UserProfileRequest request) {
	
	  User user = userRepository.findById(userId)
	          .orElseThrow(() ->
	                  new ResourceNotFoundException("User not found"));
	
	  if (request == null) {
	      throw new BadRequestException("Invalid profile request");
	  }
	
	  // ================================
	  // VALIDATE NAME
	  // ================================
	
	  if (request.getName() == null
	          || request.getName().trim().isEmpty()) {
	
	      throw new BadRequestException("Name cannot be empty");
	  }
	
	  // ================================
	  // VALIDATE EMAIL
	  // ================================
	
	  if (request.getEmail() == null
	          || request.getEmail().trim().isEmpty()) {
	
	      throw new BadRequestException("Email cannot be empty");
	  }
	
	  String newName = request.getName().trim();
	  String newEmail = request.getEmail().trim();
	
	  // ================================
	  // CHECK EMAIL
	  // ================================
	
	  if (!user.getEmail().equals(newEmail)) {
	
	      if (userRepository.existsByEmail(newEmail)) {
	          throw new ConflictException("Email already registered");
	      }
	  }
	
	  // ================================
	  // UPDATE NAME + EMAIL
	  // ================================
	
	  user.setName(newName);
	  user.setEmail(newEmail);
	
	  // ================================
	  // PASSWORD
	  // ================================
	
	  String currentPassword = request.getCurrentPassword();
	  String newPassword = request.getNewPassword();
	
	  boolean currentPasswordEntered =
	          currentPassword != null
	          && !currentPassword.trim().isEmpty();
	
	  boolean newPasswordEntered =
	          newPassword != null
	          && !newPassword.trim().isEmpty();
	
	  // If either password field is filled,
	  // both fields are required.
	  if (currentPasswordEntered || newPasswordEntered) {
	
	      if (!currentPasswordEntered) {
	          throw new BadRequestException("Current password is required");
	      }
	
	      if (!newPasswordEntered) {
	          throw new BadRequestException("New password is required");
	      }
	
	      // Check current password
	      if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
	          throw new ForbiddenException("Current password is incorrect");
	      }
	
	      // Change password
	      user.setPassword(passwordEncoder.encode(newPassword));
	  }
	
	  // ================================
	  // SAVE EVERYTHING
	  // ================================
	
	  userRepository.save(user);
	
	  return "Profile updated successfully";
	}
}