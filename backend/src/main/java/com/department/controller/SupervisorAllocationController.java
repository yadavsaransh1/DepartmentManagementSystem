package com.department.controller;

import com.department.dto.SupervisorAllocationDTO;
import com.department.service.SupervisorAllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/supervisors")
public class SupervisorAllocationController {

    @Autowired
    private SupervisorAllocationService supervisorService;

    @PostMapping("/allocate")
    public ResponseEntity<SupervisorAllocationDTO> allocateSupervisor(
            @RequestParam Long studentId,
            @RequestParam Long teacherId) {
        return ResponseEntity.ok(supervisorService.allocateSupervisor(studentId, teacherId));
    }

    @PostMapping("/allocate-phd")
    public ResponseEntity<?> allocatePhdGuide(
            @RequestParam Long studentId,
            @RequestParam String guideName,
            @RequestParam(value = "teacherId", required = false) Long teacherId,
            @RequestParam(value = "guideDepartment", required = false, defaultValue = "") String guideDepartment,
            @RequestParam(value = "specialization", required = false, defaultValue = "") String specialization) {
        try {
            SupervisorAllocationDTO result = supervisorService.allocatePhdGuide(studentId, teacherId, guideName, guideDepartment, specialization);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error allocating PhD guide: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/allocations")
    public ResponseEntity<List<SupervisorAllocationDTO>> getAllAllocations() {
        return ResponseEntity.ok(supervisorService.getAllAllocations());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<SupervisorAllocationDTO> getSupervisorForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(supervisorService.getSupervisorForStudent(studentId));
    }

    @GetMapping("/students")
    public ResponseEntity<List<SupervisorAllocationDTO>> getStudentsUnderSupervisor(
            @RequestParam Long teacherId) {
        return ResponseEntity.ok(supervisorService.getStudentsUnderSupervisor(teacherId));
    }

    @GetMapping("/students-by-email")
    public ResponseEntity<List<SupervisorAllocationDTO>> getStudentsUnderSupervisorByEmail(
            @RequestParam String teacherEmail) {
        return ResponseEntity.ok(supervisorService.getStudentsUnderSupervisorByEmail(teacherEmail));
    }

    @GetMapping("/teacher/{teacherId}/students")
    public ResponseEntity<List<SupervisorAllocationDTO>> getStudentsForTeacher(
            @PathVariable Long teacherId) {
        return ResponseEntity.ok(supervisorService.getStudentsUnderSupervisor(teacherId));
    }

    @PutMapping("/{allocationId}")
    public ResponseEntity<SupervisorAllocationDTO> updateAllocation(
            @PathVariable Long allocationId,
            @RequestParam Long newTeacherId) {
        return ResponseEntity.ok(supervisorService.updateAllocation(allocationId, newTeacherId));
    }

    @DeleteMapping("/{allocationId}")
    public ResponseEntity<String> deleteAllocation(@PathVariable Long allocationId) {
        supervisorService.deleteAllocation(allocationId);
        return ResponseEntity.ok("Allocation deleted successfully");
    }
}
