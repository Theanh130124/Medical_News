package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.SurveyOption;
import com.theanh1301.SpringBoot_Medical_News.entity.SurveyVote;
import com.theanh1301.SpringBoot_Medical_News.entity.SurveyVoteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyVoteRepository extends JpaRepository<SurveyVote,String> {

    long countByOption(SurveyOption option);
    boolean existsById(SurveyVoteId id);
}
