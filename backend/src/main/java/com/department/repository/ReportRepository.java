package com.department.repository;

import com.department.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByReportCode(String reportCode);
    List<Report> findByReportType(Report.ReportType reportType);
    
    @Query("SELECT r FROM Report r WHERE r.generatedBy.email = ?1")
    List<Report> findByGeneratedByEmail(String email);
    
    // Deprecated: Use findByGeneratedByEmail instead
    @Deprecated
    default List<Report> findByGeneratedById(Long generatedById) {
        throw new UnsupportedOperationException("Use findByGeneratedByEmail instead. User.email is now the primary key.");
    }
}
