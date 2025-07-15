package com.theanh1301.SpringBoot_Medical_News.entity;

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
@Table(name = "Search_history")
public class SearchHistory {
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
    @Column(name = "keyword", nullable = false)
    String keyword;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "searched_at")
    Instant searchedAt;

}