package com.department.controller;

import com.department.dto.FileLocationDTO;
import com.department.service.FileLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/file-locations")
public class FileLocationController {

    @Autowired
    private FileLocationService fileLocationService;

    @GetMapping
    public ResponseEntity<List<FileLocationDTO>> getAllFileLocations() {
        return ResponseEntity.ok(fileLocationService.getAllFileLocations());
    }

    @PostMapping
    public ResponseEntity<FileLocationDTO> createFileLocation(
            @RequestParam String fileName,
            @RequestParam String almirahName,
            @RequestParam(required = false) String additionalInformation) {
        return ResponseEntity.ok(fileLocationService.createFileLocation(fileName, almirahName, additionalInformation));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileLocationDTO> getFileLocationById(@PathVariable Long id) {
        return ResponseEntity.ok(fileLocationService.getFileLocationById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FileLocationDTO> updateFileLocation(
            @PathVariable Long id,
            @RequestParam(required = false) String fileName,
            @RequestParam(required = false) String almirahName,
            @RequestParam(required = false) String additionalInformation) {
        return ResponseEntity.ok(fileLocationService.updateFileLocation(id, fileName, almirahName, additionalInformation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFileLocation(@PathVariable Long id) {
        fileLocationService.deleteFileLocation(id);
        return ResponseEntity.ok("File location deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<FileLocationDTO>> searchFileLocations(@RequestParam String searchTerm) {
        return ResponseEntity.ok(fileLocationService.searchFileLocations(searchTerm));
    }
}
