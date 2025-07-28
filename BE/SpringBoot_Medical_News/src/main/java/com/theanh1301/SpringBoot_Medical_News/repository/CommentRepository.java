package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.dto.response.CommentResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Comment;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment,String> {
    List<Comment> getCommentByPost(Post post);
}
