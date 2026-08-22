package com.department.repository;

import com.department.model.HomePageTechnicalStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomePageTechnicalStaffRepository extends JpaRepository<HomePageTechnicalStaff, Long> {
    List<HomePageTechnicalStaff> findAllByOrderByCreatedAtDesc();
}
