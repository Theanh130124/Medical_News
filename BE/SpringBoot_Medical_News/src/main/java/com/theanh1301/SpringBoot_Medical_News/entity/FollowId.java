package com.theanh1301.SpringBoot_Medical_News.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class FollowId implements Serializable {
    private static final long serialVersionUID = 7879678862635999708L;
    @Size(max = 36)
    @NotNull
    @Column(name = "follower_id", nullable = false, length = 36)
    private String followerId;

    @Size(max = 36)
    @NotNull
    @Column(name = "following_id", nullable = false, length = 36)
    private String followingId;



}