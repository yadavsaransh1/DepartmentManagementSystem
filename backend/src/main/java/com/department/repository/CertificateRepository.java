package com.department.repository;

import com.department.model.Certificate;
import com.department.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByTeacher(Teacher teacher);
    List<Certificate> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
}
