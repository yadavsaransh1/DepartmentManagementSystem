package com.department.repository;

import com.department.model.CommitteePower;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommitteePowerRepository extends JpaRepository<CommitteePower, Long> {
    Optional<CommitteePower> findByPowerName(String powerName);
}
