package com.theanh1301.SpringBoot_Medical_News.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
@Table(name = "invalidatedtoken")
public class InvalidatedToken {
    @Id
    @Size(max = 36)
    @Column(name = "id", nullable = false, length = 36)
    String id;

    @NotNull
    @Column(name = "expiry_time", nullable = false)
    Date expiryTime;

}