package com.department.repository;

import com.department.model.TeacherDetails;
import com.department.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TeacherDetailsRepository extends JpaRepository<TeacherDetails, Long> {
    Optional<TeacherDetails> findByTeacher(Teacher teacher);
    
    @Query("SELECT td FROM TeacherDetails td WHERE td.teacher.id = :teacherId")
    Optional<TeacherDetails> findByTeacher_Id(@Param("teacherId") Long teacherId);
    
    boolean existsByTeacher(Teacher teacher);
}
