package com.theanh1301.SpringBoot_Medical_News.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable // Định nghĩa nguyên class để gán key chứa 2 fields cho bên Folllow
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FollowId implements Serializable {
    static final long serialVersionUID = 7879678862635999708L;
    @Size(max = 36)
    @NotNull
    @Column(name = "follower_id", nullable = false, length = 36)
    String followerId;

    @Size(max = 36)
    @NotNull
    @Column(name = "following_id", nullable = false, length = 36)
    String followingId;



}