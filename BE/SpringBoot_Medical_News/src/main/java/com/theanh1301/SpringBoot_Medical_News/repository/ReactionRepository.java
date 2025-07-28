package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.dto.response.ReactionResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReactionRepository extends JpaRepository<Reaction,String> {
    List<Reaction> getReactionByPost(Post post);
}
