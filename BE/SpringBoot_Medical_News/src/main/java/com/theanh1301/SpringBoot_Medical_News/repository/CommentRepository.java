package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.dto.response.CommentResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Comment;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment,String> {
    List<Comment> getCommentByPost(Post post);
    @Query("SELECT COUNT(c) FROM Comment c where  c.post = :post")
    long countCommentByPost(@Param("post") Post post);

}
