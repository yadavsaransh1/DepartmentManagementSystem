package com.department.repository;

import com.department.model.HomePageFaculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomePageFacultyRepository extends JpaRepository<HomePageFaculty, Long> {
    List<HomePageFaculty> findAllByOrderByCreatedAtDesc();
}
