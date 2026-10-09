package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AdminService;
import com.Av.Online.Coding.Practice.Platform.dto.AdminDashboard;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private final AdminService adminService;
	
	public AdminController(AdminService adminService) {
		this.adminService = adminService;
	}
	
	@GetMapping("/dashboard")
	public ResponseEntity<AdminDashboard> getDashboard(){
	
		AdminDashboard response = 
				adminService.getDashboardData();
		return ResponseEntity.ok(response);
		
	}
}
