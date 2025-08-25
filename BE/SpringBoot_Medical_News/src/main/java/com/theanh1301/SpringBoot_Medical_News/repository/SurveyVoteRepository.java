package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.SurveyOption;
import com.theanh1301.SpringBoot_Medical_News.entity.SurveyVote;
import com.theanh1301.SpringBoot_Medical_News.entity.SurveyVoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface SurveyVoteRepository extends JpaRepository<SurveyVote,SurveyVoteId> {


    Optional<SurveyVote> findByUserIdAndOptionId(String userId, String optionId);
    long countByOption(SurveyOption option);
    boolean existsById(SurveyVoteId id);
    List<SurveyVote> findByOption(SurveyOption option);

}
