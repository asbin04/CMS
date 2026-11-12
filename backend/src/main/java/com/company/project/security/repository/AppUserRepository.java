package com.company.project.security.repository;

import com.company.project.security.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    Optional<AppUser> findByUsernameIgnoreCase(String username);

    Optional<AppUser> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRole(String role);
}

