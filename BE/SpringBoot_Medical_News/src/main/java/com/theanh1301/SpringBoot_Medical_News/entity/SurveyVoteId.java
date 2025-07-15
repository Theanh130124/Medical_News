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
@FieldDefaults(level = AccessLevel.PRIVATE)
@Embeddable
public class SurveyVoteId implements Serializable {
    static final long serialVersionUID = 6008579102256645930L;
    @Size(max = 36)
    @NotNull
    @Column(name = "user_id", nullable = false, length = 36)
    String userId;

    @Size(max = 36)
    @NotNull
    @Column(name = "option_id", nullable = false, length = 36)
    String optionId;




}