package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CommentResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Comment;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.CommentMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.CommentRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.PostRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.CommentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentServiceImpl implements CommentService {

    CommentRepository commentRepository;
    UserRepository userRepository;
    PostRepository postRepository;
    CommentMapper commentMapper;


    @Override
    public CommentResponse createComment(CommentCreationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        //Check bài viết có bi khóa cmt
        if(post.getAllowComments().equals(Boolean.FALSE)){
            throw new AppException(ErrorCode.COMMENT_LOCKED);
        }
        Comment comment = commentMapper.toComment(request);
        comment.setUser(user);
        comment.setPost(post);
        commentRepository.save(comment);
        return commentMapper.toCommentResponse(comment);
    }


    @Override
    public CommentResponse updateComment(String commentId,CommentUpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));
        commentMapper.updateComment(comment,request);//void
        commentRepository.save(comment);
        return commentMapper.toCommentResponse(comment);
    }

    @Override
    public void deleteComment(String commentId) {
        commentRepository.deleteById(commentId);

    }

    @Override
    public Page<CommentResponse> getCommentsByPostId(String postId , Pageable pageable) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        return commentRepository.getCommentsByPost(post, pageable).map(commentMapper::toCommentResponse);
    }

    @Override
    public CommentResponse getCommentResponseById(String commentId) {
        return commentMapper.toCommentResponse(commentRepository.findById(commentId)
        .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND)));
    }

    @Override
    public long countCommentByPost(String postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        return commentRepository.countCommentByPost(post);
    }
}
