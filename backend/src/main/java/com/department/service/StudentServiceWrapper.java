package com.department.service;

import java.util.List;
import com.department.dto.StudentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Wrapper service to force recompilation of StudentService cache
 */
@Service
public class StudentServiceWrapper {
    
    @Autowired
    private StudentService studentService;
    
    public List<StudentDTO> getAllStudentsWrapped() {
        return studentService.getAllStudents();
    }
}
