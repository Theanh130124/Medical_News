package com.theanh1301.SpringBoot_Medical_News.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Survey_Vote")
public class SurveyVote {
    @EmbeddedId
    private SurveyVoteId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId("optionId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "option_id", nullable = false)
    private SurveyOption option;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "voted_at")
    private Instant votedAt;

}