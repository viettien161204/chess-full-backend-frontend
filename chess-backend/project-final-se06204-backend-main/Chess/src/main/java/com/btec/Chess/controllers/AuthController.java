package com.btec.Chess.controllers;


import com.btec.Chess.entities.User;
import com.btec.Chess.security.JwtUtil;
import com.btec.Chess.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


import org.springframework.http.ResponseEntity;


import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Sign-up: Create a new user.
     *
     * @param user The user object containing sign-up details.
     * @return ResponseEntity with the created user.
     */
    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@RequestBody User user) {
        // Check if the email already exists
        if (userService.getUserByEmail(user.getEmail()) != null) {
            return new ResponseEntity<>("Email is already taken", HttpStatus.BAD_REQUEST);
        }

        // Save the user with a hashed password
        User createdUser = userService.createUser(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    /**
     * Sign-in: Authenticate a user and return a JWT token.
     *
     * @param loginRequest A map containing email and password.
     * @return ResponseEntity with the JWT token or error message.
     */
    @PostMapping("/sign-in")
    public ResponseEntity<?> signIn(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // Find the user by email
        User user = userService.getUserByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Generate JWT token
        String token = JwtUtil.generateToken(user.getEmail());

        // Return the token
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Change password - Requires JWT token.
     *
     * @param token     The JWT token from Authorization header.
     * @param request   A map containing oldPassword and newPassword.
     * @return ResponseEntity with success or error message.
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {

        try {
            // Loại bỏ "Bearer " từ token
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // Giải mã token để lấy email người dùng
            String email = JwtUtil.extractEmail(token);

            // Kiểm tra xem người dùng có tồn tại không
            User user = userService.getUserByEmail(email);
            if (user == null) {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }

            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            // Kiểm tra mật khẩu cũ có đúng không
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return new ResponseEntity<>("Incorrect old password", HttpStatus.UNAUTHORIZED);
            }

            // Cập nhật mật khẩu mới
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUserPassword(user);

            return new ResponseEntity<>("Password changed successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid or expired token", HttpStatus.UNAUTHORIZED);
        }
    }

}
