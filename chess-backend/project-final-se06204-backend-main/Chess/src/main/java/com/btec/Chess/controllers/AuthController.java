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

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordRequest) {
        String email = passwordRequest.get("email");
        String oldPassword = passwordRequest.get("oldPassword");
        String newPassword = passwordRequest.get("newPassword");

        // Kiểm tra người dùng có tồn tại không
        User user = userService.getUserByEmail(email);
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return new ResponseEntity<>("Incorrect old password", HttpStatus.UNAUTHORIZED);
        }

        // Mã hóa và cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.updateUser(user);

        return new ResponseEntity<>("Password updated successfully", HttpStatus.OK);
    }

    /**
     * Delete User: Remove a user from the system.
     *
     * @param email The email of the user to be deleted.
     * @return ResponseEntity with a success or error message.
     */
    @DeleteMapping("/delete-user")
    public ResponseEntity<?> deleteUser(@RequestParam String email) {
        // Find the user by email
        User user = userService.getUserByEmail(email);
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        // Delete the user
        userService.deleteUser(user.getId());
        return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
    }
}
