package com.department.repository;

import com.department.model.CommitteeMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommitteeMemberRepository extends JpaRepository<CommitteeMember, Long> {
    List<CommitteeMember> findByCommitteeId(Long committeeId);
    
    Optional<CommitteeMember> findByCommitteeIdAndTeacherEmail(Long committeeId, String teacherEmail);
    
    List<CommitteeMember> findByTeacherEmail(String teacherEmail);
    
    void deleteByCommitteeIdAndTeacherEmail(Long committeeId, String teacherEmail);
}
