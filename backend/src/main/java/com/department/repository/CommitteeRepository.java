package com.department.repository;

import com.department.model.Committee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommitteeRepository extends JpaRepository<Committee, Long> {
    Optional<Committee> findByName(String name);
    
    List<Committee> findByCreatedByEmail(String email);
    
    @Query("SELECT DISTINCT c FROM Committee c JOIN c.members cm WHERE cm.teacher.email = :teacherEmail OR cm.teacher.id = :teacherEmail")
    List<Committee> findByMemberTeacherEmail(@Param("teacherEmail") String teacherEmail);
}
