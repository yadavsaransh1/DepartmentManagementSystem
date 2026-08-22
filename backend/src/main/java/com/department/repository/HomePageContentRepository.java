package com.department.repository;

import com.department.model.HomePageContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HomePageContentRepository extends JpaRepository<HomePageContent, Long> {
    Optional<HomePageContent> findFirstByOrderByIdDesc();
}
