package com.theanh1301.SpringBoot_Medical_News.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
@Table(name="invalidatedtoken")
public class InvalidatedToken {

    @Id
    String id; // chinh la jwtId
    @Column(name = "expiry_time", nullable = false)
    Date expiryTime;
}
