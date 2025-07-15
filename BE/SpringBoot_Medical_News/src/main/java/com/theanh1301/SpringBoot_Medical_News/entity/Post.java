package com.theanh1301.SpringBoot_Medical_News.entity;

import com.theanh1301.SpringBoot_Medical_News.enums.TypePost;
import com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class Post {
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

    @Size(max = 255)
    @NotNull
    @Column(name = "title", nullable = false)
    String title;

    @NotNull
    @Lob
    @Column(name = "content", nullable = false)
    String content;

    @ColumnDefault("'PUBLIC'")
    @Lob
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility")
    VisibilityPost visibility;

    @ColumnDefault("'NORMAL'")
    @Lob
    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    TypePost type;

    @ColumnDefault("1")
    @Column(name = "allow_comments")
    Boolean allowComments;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    Instant updatedAt;

}