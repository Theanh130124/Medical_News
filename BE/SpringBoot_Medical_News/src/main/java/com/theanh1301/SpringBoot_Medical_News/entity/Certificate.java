package com.theanh1301.SpringBoot_Medical_News.entity;

import com.theanh1301.SpringBoot_Medical_News.enums.CertificateStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.time.LocalDate;

@Data  // -> thay @Entity , get ,set , tostring....
@NoArgsConstructor // cần cho JPA
@AllArgsConstructor //
@Builder // thay gọn cho set
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Certificate {
    @Id
    @Size(max = 36)
    @ColumnDefault("(uuid())")
    @Column(name = "id", nullable = false, length = 36)
    String id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Size(max = 100)
    @NotNull
    @Column(name = "certificate_number", nullable = false, length = 100)
    String certificateNumber;

    @NotNull
    @Column(name = "issue_date", nullable = false)
    LocalDate issueDate;

    @Column(name = "expiry_date")
    LocalDate expiryDate;

    @Size(max = 255)
    @NotNull
    @Column(name = "image_certificate", nullable = false)
    String imageCertificate;

    @ColumnDefault("'PENDING'")
    @Enumerated(EnumType.STRING) // để lưu Enum String , không có sẽ lưu thứ tự
    @Column(name = "status")
    CertificateStatus status;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    Instant updatedAt;

}