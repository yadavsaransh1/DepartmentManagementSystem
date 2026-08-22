package com.department.repository;

import com.department.model.AttendanceColorSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendanceColorSettingsRepository extends JpaRepository<AttendanceColorSettings, Long> {
    Optional<AttendanceColorSettings> findByRole(String role);
}
