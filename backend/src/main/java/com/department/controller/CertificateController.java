package com.department.controller;

import com.department.dto.CertificateDTO;
import com.department.model.Certificate;
import com.department.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @PostMapping("/upload")
    public ResponseEntity<CertificateDTO> uploadCertificate(
            @RequestParam("file") MultipartFile file,
            @RequestParam("teacherEmail") String teacherEmail,
            @RequestParam("certificateName") String certificateName,
            @RequestParam("issuer") String issuer,
            @RequestParam("issuedDate") String issuedDate,
            @RequestParam("expiryDate") String expiryDate,
            @RequestParam(required = false) String description) {
        try {
            CertificateDTO certificateDTO = certificateService.uploadCertificate(
                    file, teacherEmail, certificateName, issuer, issuedDate, expiryDate, description);
            return ResponseEntity.ok(certificateDTO);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/teacher/{teacherEmail}")
    public ResponseEntity<List<CertificateDTO>> getCertificatesByTeacher(@PathVariable String teacherEmail) {
        try {
            List<CertificateDTO> certificates = certificateService.getCertificatesByTeacher(teacherEmail);
            return ResponseEntity.ok(certificates);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{certificateId}/details")
    public ResponseEntity<CertificateDTO> getCertificateDetails(@PathVariable Long certificateId) {
        try {
            CertificateDTO certificateDTO = certificateService.getCertificateDetails(certificateId);
            return ResponseEntity.ok(certificateDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{certificateId}/download")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long certificateId) {
        try {
            Optional<Certificate> certificate = certificateService.getCertificateFile(certificateId);
            if (certificate.isPresent()) {
                Certificate cert = certificate.get();
                // Note: For actual file download, implement file storage logic
                // This is a placeholder - in production, load file from filePath
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cert.getFileName() + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, cert.getFileType())
                        .body(new byte[0]); // Placeholder - implement actual file loading
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{certificateId}")
    public ResponseEntity<CertificateDTO> updateCertificate(
            @PathVariable Long certificateId,
            @RequestParam(required = false) String certificateName,
            @RequestParam(required = false) String issuer,
            @RequestParam(required = false) String issuedDate,
            @RequestParam(required = false) String expiryDate,
            @RequestParam(required = false) String description) {
        try {
            CertificateDTO updatedCertificate = certificateService.updateCertificate(
                    certificateId, certificateName, issuer, issuedDate, expiryDate, description);
            return ResponseEntity.ok(updatedCertificate);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{certificateId}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable Long certificateId) {
        if (certificateService.deleteCertificate(certificateId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
