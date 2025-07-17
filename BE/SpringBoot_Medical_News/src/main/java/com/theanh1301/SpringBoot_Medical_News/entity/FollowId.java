package com.theanh1301.SpringBoot_Medical_News.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        FollowId entity = (FollowId) o;
        return Objects.equals(this.followingId, entity.followingId) &&
                Objects.equals(this.followerId, entity.followerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(followingId, followerId);
    }

}