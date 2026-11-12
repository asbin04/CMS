package com.company.project.clients.repository;

import com.company.project.clients.entity.ClientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<ClientEntity, String> {
    Optional<ClientEntity> findByClientCode(String clientCode);
}
