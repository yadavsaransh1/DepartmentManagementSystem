package com.department.repository;

import com.department.model.SupervisorAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupervisorAllocationRepository extends JpaRepository<SupervisorAllocation, Long> {
    Optional<SupervisorAllocation> findByStudentId(Long studentId);
    List<SupervisorAllocation> findAllByStudentId(Long studentId);
    List<SupervisorAllocation> findByTeacherId(Long teacherId);
    List<SupervisorAllocation> findAll();
    void deleteByStudentId(Long studentId);
    
    // Query to find PhD guide allocations by teacher
    @Query("SELECT a FROM SupervisorAllocation a WHERE a.allocationType = 'GUIDE' AND a.teacher.id = :teacherId")
    List<SupervisorAllocation> findPhdGuidesByTeacherId(@Param("teacherId") Long teacherId);
}
