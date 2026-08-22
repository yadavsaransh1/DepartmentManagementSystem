package com.department.controller;

import com.department.model.*;
import com.department.service.HomePageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/home-page")
public class HomePageController {
    
    @Autowired
    private HomePageService homePageService;
    
    // Public endpoint to get home page content
    @GetMapping("/content")
    public ResponseEntity<HomePageContent> getHomePageContent() {
        try {
            HomePageContent content = homePageService.getOrCreateHomePageContent();
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Admin endpoint to update home page content
    @PostMapping("/content")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageContent> updateHomePageContent(@RequestBody HomePageContent content) {
        try {
            HomePageContent updated = homePageService.updateHomePageContent(content);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Admin endpoint to update home page content (PUT method)
    @PutMapping("/content")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageContent> putHomePageContent(@RequestBody HomePageContent content) {
        try {
            HomePageContent updated = homePageService.updateHomePageContent(content);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Public endpoint to get all faculty
    @GetMapping("/faculty")
    public ResponseEntity<List<HomePageFaculty>> getAllFaculty() {
        try {
            List<HomePageFaculty> faculty = homePageService.getAllFaculty();
            return ResponseEntity.ok(faculty);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Admin endpoint to add faculty
    @PostMapping("/faculty")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageFaculty> addFaculty(@RequestBody HomePageFaculty faculty) {
        try {
            HomePageFaculty created = homePageService.addFaculty(faculty);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Admin endpoint to update faculty
    @PutMapping("/faculty/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageFaculty> updateFaculty(@PathVariable Long id, @RequestBody HomePageFaculty faculty) {
        try {
            HomePageFaculty updated = homePageService.updateFaculty(id, faculty);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Admin endpoint to delete faculty
    @DeleteMapping("/faculty/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        try {
            homePageService.deleteFaculty(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    // Teaching Assistant Endpoints
    @GetMapping("/teaching-assistant")
    public ResponseEntity<List<HomePageTeachingAssistant>> getAllTeachingAssistants() {
        try {
            List<HomePageTeachingAssistant> assistants = homePageService.getAllTeachingAssistants();
            return ResponseEntity.ok(assistants);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @PostMapping("/teaching-assistant")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageTeachingAssistant> addTeachingAssistant(@RequestBody HomePageTeachingAssistant assistant) {
        try {
            HomePageTeachingAssistant created = homePageService.addTeachingAssistant(assistant);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @PutMapping("/teaching-assistant/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageTeachingAssistant> updateTeachingAssistant(@PathVariable Long id, @RequestBody HomePageTeachingAssistant assistant) {
        try {
            HomePageTeachingAssistant updated = homePageService.updateTeachingAssistant(id, assistant);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @DeleteMapping("/teaching-assistant/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTeachingAssistant(@PathVariable Long id) {
        try {
            homePageService.deleteTeachingAssistant(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    // Technical Staff Endpoints
    @GetMapping("/technical-staff")
    public ResponseEntity<List<HomePageTechnicalStaff>> getAllTechnicalStaff() {
        try {
            List<HomePageTechnicalStaff> staff = homePageService.getAllTechnicalStaff();
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @PostMapping("/technical-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageTechnicalStaff> addTechnicalStaff(@RequestBody HomePageTechnicalStaff staff) {
        try {
            HomePageTechnicalStaff created = homePageService.addTechnicalStaff(staff);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @PutMapping("/technical-staff/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageTechnicalStaff> updateTechnicalStaff(@PathVariable Long id, @RequestBody HomePageTechnicalStaff staff) {
        try {
            HomePageTechnicalStaff updated = homePageService.updateTechnicalStaff(id, staff);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @DeleteMapping("/technical-staff/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTechnicalStaff(@PathVariable Long id) {
        try {
            homePageService.deleteTechnicalStaff(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    // Non-Teaching Employee Endpoints
    @GetMapping("/non-teaching-employee")
    public ResponseEntity<List<HomePageNonTeachingEmployee>> getAllNonTeachingEmployees() {
        try {
            List<HomePageNonTeachingEmployee> employees = homePageService.getAllNonTeachingEmployees();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @PostMapping("/non-teaching-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageNonTeachingEmployee> addNonTeachingEmployee(@RequestBody HomePageNonTeachingEmployee employee) {
        try {
            HomePageNonTeachingEmployee created = homePageService.addNonTeachingEmployee(employee);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @PutMapping("/non-teaching-employee/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageNonTeachingEmployee> updateNonTeachingEmployee(@PathVariable Long id, @RequestBody HomePageNonTeachingEmployee employee) {
        try {
            HomePageNonTeachingEmployee updated = homePageService.updateNonTeachingEmployee(id, employee);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @DeleteMapping("/non-teaching-employee/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNonTeachingEmployee(@PathVariable Long id) {
        try {
            homePageService.deleteNonTeachingEmployee(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
