package com.department.config;

import com.department.model.*;
import com.department.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Check if data already initialized
        if (userRepository.count() > 1) {
            System.out.println("Database already initialized with data. Skipping initialization.");
            return;
        }

        // Create/reset default admin user
        userRepository.deleteByEmail("admin@university.com");
        
        User admin = new User();
        admin.setEmail("admin@university.com");
        admin.setPassword(passwordEncoder.encode("admin123456"));
        admin.setFullName("Admin User");
        admin.setRole(User.UserRole.ADMIN);
        admin.setIsActive(true);
        
        userRepository.save(admin);
        System.out.println("✓ Admin user created/refreshed: admin@university.com");
        
        // Create 10 subjects if they don't exist
        if (subjectRepository.count() == 0) {
            String[][] subjects = {
                {"CS101", "Data Structures"},
                {"CS102", "Algorithms"},
                {"CS201", "Database Management"},
                {"MATH101", "Calculus"},
                {"MATH201", "Linear Algebra"},
                {"PHY101", "Mechanics"},
                {"PHY201", "Thermodynamics"},
                {"CHEM101", "Organic Chemistry"},
                {"ENG101", "English Literature"},
                {"BIO101", "General Biology"}
            };
            
            String[] courses = {"B.Tech", "B.Sc", "M.Tech", "M.Sc", "BBA"};
            
            List<Teacher> teachers = teacherRepository.findAll();
            for (int i = 0; i < subjects.length && i < teachers.size(); i++) {
                Subject subject = new Subject(subjects[i][0], subjects[i][1], teachers.get(i));
                subject.setSemester((i % 4) + 1);
                subject.setCredits(4);
                
                // Set program by looking up from database
                String courseName = courses[i % 5];
                Program program = programRepository.findByName(courseName)
                        .orElse(null);
                subject.setProgram(program);
                
                subject.setDescription("A comprehensive course on " + subjects[i][1]);
                subjectRepository.save(subject);
            }
            System.out.println("✓ 10 subjects created and assigned to teachers with courses");
        }
        
        // Create dummy attendance data for 1 month
        if (attendanceRepository.count() < 100) {
            List<Student> students = studentRepository.findAll();
            List<Subject> allSubjects = subjectRepository.findAll();
            Random random = new Random();
            
            LocalDate startDate = LocalDate.now().minusDays(30);
            for (int day = 0; day < 30; day++) {
                LocalDate attendanceDate = startDate.plusDays(day);
                
                // Skip weekends
                if (attendanceDate.getDayOfWeek().getValue() >= 6) continue;
                
                for (Student student : students) {
                    if (allSubjects.isEmpty()) break;
                    Subject subject = allSubjects.get(random.nextInt(allSubjects.size()));
                    
                    Attendance attendance = new Attendance();
                    attendance.setStudent(student);
                    attendance.setSubject(subject);
                    attendance.setAttendanceDate(attendanceDate);
                    
                    // Randomly assign status: 70% present, 20% absent, 10% late
                    int rand = random.nextInt(100);
                    if (rand < 70) {
                        attendance.setStatus("PRESENT");
                    } else if (rand < 90) {
                        attendance.setStatus("ABSENT");
                    } else {
                        attendance.setStatus("LATE");
                    }
                    
                    attendanceRepository.save(attendance);
                }
            }
            System.out.println("✓ Dummy attendance data created for 1 month");
        }
    }
}
