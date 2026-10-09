package com.Av.Online.Coding.Practice.Platform.dto;

public class UserProfileRequest {

    private String name;

    private String email;

    private String currentPassword;

    private String newPassword;


    public UserProfileRequest() {
    }


    // ================================
    // NAME
    // ================================

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    // ================================
    // EMAIL
    // ================================

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    // ================================
    // CURRENT PASSWORD
    // ================================

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }


    // ================================
    // NEW PASSWORD
    // ================================

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}