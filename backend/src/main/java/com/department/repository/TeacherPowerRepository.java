package com.department.repository;

import com.department.model.TeacherPower;
import com.department.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherPowerRepository extends JpaRepository<TeacherPower, Long> {
    Optional<TeacherPower> findByTeacher(User teacher);
    List<TeacherPower> findAll();
    List<TeacherPower> findByIsHoDTrue();
}
