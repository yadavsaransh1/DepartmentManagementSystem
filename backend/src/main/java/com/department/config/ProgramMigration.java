package com.department.config;

import com.department.model.Program;
import com.department.model.Subject;
import com.department.repository.ProgramRepository;
import com.department.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.logging.Logger;

@Component
public class ProgramMigration implements CommandLineRunner {
    private static final Logger logger = Logger.getLogger(ProgramMigration.class.getName());

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            migrateSubjectPrograms();
        } catch (Exception e) {
            logger.severe("Program migration failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public void migrateSubjectPrograms() {
        logger.info("Starting Program Migration for Subjects");
        
        // Get all subjects
        List<Subject> subjects = subjectRepository.findAll();
        List<Program> programs = programRepository.findAll();
        
        logger.info("Found " + subjects.size() + " subjects and " + programs.size() + " programs");
        
        int migratedCount = 0;
        
        for (Subject subject : subjects) {
            // If program_id is already set, skip
            if (subject.getProgram() != null) {
                logger.fine("Subject " + subject.getId() + " (" + subject.getCourseCode() + ") already has program set");
                continue;
            }
            
            // Try to find and link program based on programName field (old VARCHAR column named "program")
            String programName = subject.getProgramName();
            if (programName != null && !programName.trim().isEmpty()) {
                Program matchedProgram = programs.stream()
                        .filter(p -> {
                            // Case-insensitive matching
                            String pName = p.getName().toUpperCase().trim();
                            String subjProgram = programName.toUpperCase().trim();
                            // Handle "M.Tech" vs "Mtech" comparison
                            if (pName.equals("MTECH") && subjProgram.equals("M.TECH")) return true;
                            return pName.equals(subjProgram);
                        })
                        .findFirst()
                        .orElse(null);
                
                if (matchedProgram != null) {
                    subject.setProgram(matchedProgram);
                    subjectRepository.save(subject);
                    migratedCount++;
                    logger.fine("Migrated Subject " + subject.getId() + " (" + subject.getCourseCode() + ") to Program: " + matchedProgram.getName());
                } else {
                    logger.warning("Could not find Program matching program name: '" + programName + "' for Subject: " + subject.getCourseCode());
                }
            } else {
                logger.fine("Subject " + subject.getId() + " (" + subject.getCourseCode() + ") has no program name to migrate");
            }
        }
        
        if (migratedCount > 0) {
            logger.info("✓ Migrated " + migratedCount + " subjects to use Program entity");
        } else {
            logger.info("✓ No subjects needed migration. All are already linked to Programs or have no program name.");
        }
    }
}
