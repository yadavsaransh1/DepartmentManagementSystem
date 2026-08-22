package com.department.repository;

import com.department.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findBySemester(String semester);
    List<Routine> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    
    // Find routines by uploader email
    List<Routine> findByUploadedByEmailOrderByCreatedAtDesc(String email);
    
    // Deprecated: Use findByUploadedByEmailOrderByCreatedAtDesc instead
    @Deprecated
    default List<Routine> findByUploadedByIdOrderByCreatedAtDesc(Long userId) {
        throw new UnsupportedOperationException("Use findByUploadedByEmailOrderByCreatedAtDesc instead. User.email is now the primary key.");
    }
}
