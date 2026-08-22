package com.department.service;

import com.department.model.*;
import com.department.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HomePageService {
    
    @Autowired
    private HomePageContentRepository homePageContentRepository;
    
    @Autowired
    private HomePageFacultyRepository homePageFacultyRepository;
    
    @Autowired
    private HomePageTeachingAssistantRepository teachingAssistantRepository;
    
    @Autowired
    private HomePageTechnicalStaffRepository technicalStaffRepository;
    
    @Autowired
    private HomePageNonTeachingEmployeeRepository nonTeachingEmployeeRepository;
    
    // Department Content Methods
    public HomePageContent getOrCreateHomePageContent() {
        Optional<HomePageContent> existing = homePageContentRepository.findFirstByOrderByIdDesc();
        if (existing.isPresent()) {
            return existing.get();
        }
        return new HomePageContent();
    }
    
    public HomePageContent updateHomePageContent(HomePageContent content) {
        HomePageContent existing = getOrCreateHomePageContent();
        
        // Simply save the entire content object
        if (content.getId() != null) {
            existing.setId(content.getId());
        }
        if (content.getDepartmentTitle() != null) {
            existing.setDepartmentTitle(content.getDepartmentTitle());
        }
        if (content.getDepartmentDescription() != null) {
            existing.setDepartmentDescription(content.getDepartmentDescription());
        }
        if (content.getDepartmentImage() != null) {
            existing.setDepartmentImage(content.getDepartmentImage());
        }
        
        if (content.getDeanName() != null) {
            existing.setDeanName(content.getDeanName());
        }
        if (content.getDeanDesignation() != null) {
            existing.setDeanDesignation(content.getDeanDesignation());
        }
        if (content.getDeanDescription() != null) {
            existing.setDeanDescription(content.getDeanDescription());
        }
        if (content.getDeanImage() != null) {
            existing.setDeanImage(content.getDeanImage());
        }
        
        if (content.getHodName() != null) {
            existing.setHodName(content.getHodName());
        }
        if (content.getHodDesignation() != null) {
            existing.setHodDesignation(content.getHodDesignation());
        }
        if (content.getHodDescription() != null) {
            existing.setHodDescription(content.getHodDescription());
        }
        if (content.getHodImage() != null) {
            existing.setHodImage(content.getHodImage());
        }
        
        // Department Logo Section
        if (content.getDepartmentLogo() != null) {
            existing.setDepartmentLogo(content.getDepartmentLogo());
        }
        if (content.getLogoAltText() != null) {
            existing.setLogoAltText(content.getLogoAltText());
        }
        
        return homePageContentRepository.save(existing);
    }
    
    // Faculty Methods
    public List<HomePageFaculty> getAllFaculty() {
        return homePageFacultyRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public HomePageFaculty addFaculty(HomePageFaculty faculty) {
        return homePageFacultyRepository.save(faculty);
    }
    
    public HomePageFaculty updateFaculty(Long id, HomePageFaculty faculty) {
        Optional<HomePageFaculty> existing = homePageFacultyRepository.findById(id);
        if (existing.isPresent()) {
            HomePageFaculty updated = existing.get();
            if (faculty.getName() != null) {
                updated.setName(faculty.getName());
            }
            if (faculty.getDesignation() != null) {
                updated.setDesignation(faculty.getDesignation());
            }
            if (faculty.getDescription() != null) {
                updated.setDescription(faculty.getDescription());
            }
            if (faculty.getImage() != null) {
                updated.setImage(faculty.getImage());
            }
            return homePageFacultyRepository.save(updated);
        }
        return null;
    }
    
    public void deleteFaculty(Long id) {
        homePageFacultyRepository.deleteById(id);
    }
    
    // Teaching Assistant Methods
    public List<HomePageTeachingAssistant> getAllTeachingAssistants() {
        return teachingAssistantRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public HomePageTeachingAssistant addTeachingAssistant(HomePageTeachingAssistant assistant) {
        return teachingAssistantRepository.save(assistant);
    }
    
    public HomePageTeachingAssistant updateTeachingAssistant(Long id, HomePageTeachingAssistant assistant) {
        Optional<HomePageTeachingAssistant> existing = teachingAssistantRepository.findById(id);
        if (existing.isPresent()) {
            HomePageTeachingAssistant updated = existing.get();
            if (assistant.getName() != null) updated.setName(assistant.getName());
            if (assistant.getDesignation() != null) updated.setDesignation(assistant.getDesignation());
            if (assistant.getDescription() != null) updated.setDescription(assistant.getDescription());
            if (assistant.getImage() != null) updated.setImage(assistant.getImage());
            if (assistant.getQualification() != null) updated.setQualification(assistant.getQualification());
            return teachingAssistantRepository.save(updated);
        }
        return null;
    }
    
    public void deleteTeachingAssistant(Long id) {
        teachingAssistantRepository.deleteById(id);
    }
    
    // Technical Staff Methods
    public List<HomePageTechnicalStaff> getAllTechnicalStaff() {
        return technicalStaffRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public HomePageTechnicalStaff addTechnicalStaff(HomePageTechnicalStaff staff) {
        return technicalStaffRepository.save(staff);
    }
    
    public HomePageTechnicalStaff updateTechnicalStaff(Long id, HomePageTechnicalStaff staff) {
        Optional<HomePageTechnicalStaff> existing = technicalStaffRepository.findById(id);
        if (existing.isPresent()) {
            HomePageTechnicalStaff updated = existing.get();
            if (staff.getName() != null) updated.setName(staff.getName());
            if (staff.getDesignation() != null) updated.setDesignation(staff.getDesignation());
            if (staff.getDescription() != null) updated.setDescription(staff.getDescription());
            if (staff.getImage() != null) updated.setImage(staff.getImage());
            if (staff.getSpecialization() != null) updated.setSpecialization(staff.getSpecialization());
            return technicalStaffRepository.save(updated);
        }
        return null;
    }
    
    public void deleteTechnicalStaff(Long id) {
        technicalStaffRepository.deleteById(id);
    }
    
    // Non-Teaching Employee Methods
    public List<HomePageNonTeachingEmployee> getAllNonTeachingEmployees() {
        return nonTeachingEmployeeRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public HomePageNonTeachingEmployee addNonTeachingEmployee(HomePageNonTeachingEmployee employee) {
        return nonTeachingEmployeeRepository.save(employee);
    }
    
    public HomePageNonTeachingEmployee updateNonTeachingEmployee(Long id, HomePageNonTeachingEmployee employee) {
        Optional<HomePageNonTeachingEmployee> existing = nonTeachingEmployeeRepository.findById(id);
        if (existing.isPresent()) {
            HomePageNonTeachingEmployee updated = existing.get();
            if (employee.getName() != null) updated.setName(employee.getName());
            if (employee.getDesignation() != null) updated.setDesignation(employee.getDesignation());
            if (employee.getDescription() != null) updated.setDescription(employee.getDescription());
            if (employee.getImage() != null) updated.setImage(employee.getImage());
            if (employee.getDepartment() != null) updated.setDepartment(employee.getDepartment());
            return nonTeachingEmployeeRepository.save(updated);
        }
        return null;
    }
    
    public void deleteNonTeachingEmployee(Long id) {
        nonTeachingEmployeeRepository.deleteById(id);
    }
}
