package com.department.service;

import com.department.dto.CertificateDTO;
import com.department.model.Certificate;
import com.department.model.Teacher;
import com.department.repository.CertificateRepository;
import com.department.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

    public CertificateDTO uploadCertificate(MultipartFile file, String teacherEmail, String certificateName,
                                           String issuer, String issuedDate, String expiryDate,
                                           String description) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 20MB");
        }

        Teacher teacher = teacherRepository.findByUserEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        String filePath = "certificates/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();

        Certificate certificate = new Certificate();
        certificate.setTeacher(teacher);
        certificate.setCertificateName(certificateName);
        certificate.setIssuer(issuer);
        certificate.setIssuedDate(issuedDate);
        certificate.setExpiryDate(expiryDate);
        certificate.setFileName(file.getOriginalFilename());
        certificate.setFileType(file.getContentType());
        certificate.setFileSize(file.getSize());
        certificate.setFilePath(filePath);
        certificate.setDescription(description);
        certificate.setDownloadCount(0);
        certificate.setCreatedAt(LocalDateTime.now());
        certificate.setUpdatedAt(LocalDateTime.now());

        Certificate savedCertificate = certificateRepository.save(certificate);
        return convertToDTO(savedCertificate);
    }

    public List<CertificateDTO> getCertificatesByTeacher(String teacherEmail) {
        Teacher teacher = teacherRepository.findByUserEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        return certificateRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<Certificate> getCertificateFile(Long certificateId) {
        Optional<Certificate> cert = certificateRepository.findById(certificateId);
        if (cert.isPresent()) {
            cert.get().setDownloadCount(cert.get().getDownloadCount() + 1);
            certificateRepository.save(cert.get());
        }
        return cert;
    }

    public CertificateDTO getCertificateDetails(Long certificateId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return convertToDTO(certificate);
    }

    public CertificateDTO updateCertificate(Long certificateId, String certificateName, 
                                            String issuer, String issuedDate, String expiryDate, String description) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        certificate.setCertificateName(certificateName);
        certificate.setIssuer(issuer);
        certificate.setIssuedDate(issuedDate);
        certificate.setExpiryDate(expiryDate);
        certificate.setDescription(description);
        certificate.setUpdatedAt(LocalDateTime.now());

        Certificate updatedCertificate = certificateRepository.save(certificate);
        return convertToDTO(updatedCertificate);
    }

    public boolean deleteCertificate(Long certificateId) {
        if (certificateRepository.existsById(certificateId)) {
            certificateRepository.deleteById(certificateId);
            return true;
        }
        return false;
    }

    private CertificateDTO convertToDTO(Certificate certificate) {
        CertificateDTO dto = new CertificateDTO();
        dto.setId(certificate.getId());
        dto.setTeacherId(certificate.getTeacher().getId());
        dto.setTeacherName(certificate.getTeacher().getUser().getFullName());
        dto.setCertificateName(certificate.getCertificateName());
        dto.setIssuer(certificate.getIssuer());
        dto.setIssuedDate(certificate.getIssuedDate());
        dto.setExpiryDate(certificate.getExpiryDate());
        dto.setFileName(certificate.getFileName());
        dto.setFileType(certificate.getFileType());
        dto.setFileSize(certificate.getFileSize());
        dto.setDescription(certificate.getDescription());
        dto.setDownloadCount(certificate.getDownloadCount());

        if (certificate.getCreatedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            dto.setCreatedAt(certificate.getCreatedAt().format(formatter));
        }

        return dto;
    }
}
