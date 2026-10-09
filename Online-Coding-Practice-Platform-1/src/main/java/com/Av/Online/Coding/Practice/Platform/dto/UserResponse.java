package com.Av.Online.Coding.Practice.Platform.dto;

import com.Av.Online.Coding.Practice.Platform.entity.Role;
import com.Av.Online.Coding.Practice.Platform.entity.User;

public class UserResponse {

	private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private String token;

    public UserResponse() {
    }

    public UserResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.active = user.isActive();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
