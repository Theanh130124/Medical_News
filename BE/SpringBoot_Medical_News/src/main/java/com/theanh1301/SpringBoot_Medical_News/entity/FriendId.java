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
public class FriendId implements Serializable {
    private static final long serialVersionUID = 3290323705609597784L;
    @Size(max = 36)
    @NotNull
    @Column(name = "first_user_id", nullable = false, length = 36)
    private String firstUserId;

    @Size(max = 36)
    @NotNull
    @Column(name = "second_user_id", nullable = false, length = 36)
    private String secondUserId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        FriendId entity = (FriendId) o;
        return Objects.equals(this.secondUserId, entity.secondUserId) &&
                Objects.equals(this.firstUserId, entity.firstUserId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(secondUserId, firstUserId);
    }

}