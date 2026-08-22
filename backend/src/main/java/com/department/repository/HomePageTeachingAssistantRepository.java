package com.department.repository;

import com.department.model.HomePageTeachingAssistant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomePageTeachingAssistantRepository extends JpaRepository<HomePageTeachingAssistant, Long> {
    List<HomePageTeachingAssistant> findAllByOrderByCreatedAtDesc();
}
