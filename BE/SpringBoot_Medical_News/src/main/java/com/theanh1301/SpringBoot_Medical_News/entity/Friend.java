package com.theanh1301.SpringBoot_Medical_News.entity;

import com.theanh1301.SpringBoot_Medical_News.enums.FriendStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Friends")
public class Friend {
    @EmbeddedId
    FriendId id;

    @MapsId("firstUserId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "first_user_id", nullable = false)
    User firstUser;

    @MapsId("secondUserId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "second_user_id", nullable = false)
    User secondUser;

    @ColumnDefault("'PENDING'")
    @Lob
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    FriendStatus status;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    Instant updatedAt;

}