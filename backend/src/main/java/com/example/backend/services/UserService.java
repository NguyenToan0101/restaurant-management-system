package com.example.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.UserDTO;
import com.example.backend.dto.request.ChangePasswordRequest;
import com.example.backend.dto.request.ForgetPasswordRequest;
import com.example.backend.dto.request.SignupRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.Role;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repositories.RoleRepository;
import com.example.backend.repositories.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    public List<UserDTO> getAll() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(user -> user.getStatus() == EntityStatus.ACTIVE)
                .filter(user -> user.getRole().getName() != RoleName.ADMIN)
                .map(userMapper::toUserDto)
                .toList();
    }

    public List<UserDTO> getAllIncludeDeleted() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(user -> user.getRole().getName() != RoleName.ADMIN)
                .map(userMapper::toUserDto)
                .toList();
    }

    public UserDTO signUp(SignupRequest signupRequest) {
        // Email should be unique
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        
        User newUser = userMapper.signUp(signupRequest);
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        
        Role ownerRole = roleRepository.findByName(RoleName.RESTAURANT_OWNER)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOTEXISTED));
        newUser.setRole(ownerRole);
        newUser.setStatus(EntityStatus.ACTIVE);
        
        return userMapper.toUserDto(userRepository.save(newUser));
    }

    public UserDTO getUserById(UUID userId) {
        return userMapper.toUserDto(
            userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED))
        );
    }

    public UserDTO setUserStatusById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        
        if (user.getStatus() == EntityStatus.ACTIVE) {
            user.setStatus(EntityStatus.INACTIVE);
        } else {
            user.setStatus(EntityStatus.ACTIVE);
        }
        
        return userMapper.toUserDto(userRepository.save(user));
    }

    public UserDTO updateUser(UserDTO userDTO) {
        User user = userRepository.findById(userDTO.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        
        user.setEmail(userDTO.getEmail());
        user.setUsername(userDTO.getUsername());
        user.setRole(roleRepository.findByName(userDTO.getRole().getName())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOTEXISTED)));
        
        return userMapper.toUserDto(userRepository.save(user));
    }
    
    public PageResponse<UserDTO> getUserPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<User> pageData = userRepository.findByRole_NameNot(RoleName.ADMIN, pageable);
        
        PageResponse<UserDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(userMapper::toUserDto).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        
        return pageResponse;
    }

    public boolean changePassword(ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findById(changePasswordRequest.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        
        if (passwordEncoder.matches(changePasswordRequest.getPassword(), user.getPassword())) {
            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            userRepository.save(user);
            return true;
        }
        
        throw new AppException(ErrorCode.PASSWORD_NOTMATCH);
    }

    public boolean forgetPassword(ForgetPasswordRequest forgetPasswordRequest) {
        User user = userRepository.findByEmail(forgetPasswordRequest.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        
        user.setPassword(passwordEncoder.encode(forgetPasswordRequest.getPassword()));
        return userRepository.save(user) != null;
    }
}
