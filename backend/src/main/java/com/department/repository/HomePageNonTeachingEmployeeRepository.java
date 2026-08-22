package com.department.repository;

import com.department.model.HomePageNonTeachingEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomePageNonTeachingEmployeeRepository extends JpaRepository<HomePageNonTeachingEmployee, Long> {
    List<HomePageNonTeachingEmployee> findAllByOrderByCreatedAtDesc();
}
