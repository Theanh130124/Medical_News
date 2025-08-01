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

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
@Table(name = "doctor")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, length = 36)
    String id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Size(max = 100)
    @Column(name = "specialty", length = 100)
    String specialty;

    @Column(name = "years_of_experience")
    Integer yearsOfExperience;

    @Size(max = 255)
    @Column(name = "workplace")
    String workplace;

    @Size(max = 100)
    @Column(name = "educational_level", length = 100)
    String educationalLevel;

    @Lob
    @Column(name = "introduction")
    String introduction;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    Instant updatedAt;


    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

}