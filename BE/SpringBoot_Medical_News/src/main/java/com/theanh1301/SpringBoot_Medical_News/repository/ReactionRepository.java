package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.dto.response.ReactionResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReactionRepository extends JpaRepository<Reaction,String> {
    List<Reaction> getReactionByPost(Post post);
    @Query("SELECT COUNT(r) FROM Reaction r where r.post = :post")
    long countReactionByPost(@Param("post") Post post); //:post = "post"
}
