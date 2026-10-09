package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.UserResponse;
import com.Av.Online.Coding.Practice.Platform.entity.User;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class UserManagementService {
	
	 private final UserRepository userRepository;

	    public UserManagementService(UserRepository userRepository) {
	        this.userRepository = userRepository;
	    }

	    public List<UserResponse> getAllUsers() {
	        return userRepository.findAll().stream()
	        		.map(UserResponse::new).toList();
	    }

	    public List<UserResponse> getActiveUsers() {
	        return userRepository.findByActive(true).stream()
	        		.map(UserResponse::new).toList();
	    }

	    public List<UserResponse> getBlockedUsers() {
	        return userRepository.findByActive(false).stream()
	        		.map(UserResponse::new).toList();
	    }

	    public String blockUser(Long id) {

	        User user = userRepository.findById(id)
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("User not found"));

	        user.setActive(false);
	        userRepository.save(user);

	        return "User blocked successfully";
	    }

	    public String unblockUser(Long id) {

	        User user = userRepository.findById(id)
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("User not found"));

	        user.setActive(true);
	        userRepository.save(user);

	        return "User unblocked successfully";
	    }

}
