package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.SurveyOptionResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.*;
import com.theanh1301.SpringBoot_Medical_News.enums.TypePost;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.ImagePostMapper;
import com.theanh1301.SpringBoot_Medical_News.mapper.PostMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.*;
import com.theanh1301.SpringBoot_Medical_News.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.stream.Collectors;
import java.io.IOException;
import java.util.List;
import java.util.Map;



@Transactional  // create có transaction
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
public class PostServiceImpl implements PostService {

    PostRepository postRepository;
    PostMapper postMapper;
    UserRepository userRepository;
    Cloudinary cloudinary;
    SurveyOptionRepository surveyOptionRepository;
    SurveyVoteRepository surveyVoteRepository;
    ImagePostMapper imagePostMapper;
    FriendRepository friendRepository;


    private List<ImagePost> mapMultipartFilesToImagePosts(List<MultipartFile> files, Post post) {
        if (files == null || files.isEmpty()) return null;

        return files.stream().map(file -> {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto")
                );
                return ImagePost.builder() // thêm vào bảng ImagePost
                        .postImageUrl(uploadResult.get("secure_url").toString())
                        .post(post)
                        .build();
            } catch (IOException e) {
                throw new RuntimeException("Tải ảnh bài viết thất bại", e);
            }
        }).collect(Collectors.toList());
    }


    @Override
    public PostResponse createPost(PostCreationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        Post post = postMapper.toPost(request);
        post.setUser(user);

        List<ImagePost> imagePosts = mapMultipartFilesToImagePosts(request.getImagePosts(), post);
        if (imagePosts != null) {
            post.setImagePosts(imagePosts);
        }

        // Nếu là survey thì set options luôn vào post
        if (TypePost.SURVEY.equals(post.getType()) && request.getSurveyOptions() != null) {
            List<SurveyOption> options = request.getSurveyOptions().stream()
                    .map(opt -> SurveyOption.builder()
                            .post(post)
                            .optionText(opt)
                            .build())
                    .toList();
            post.setSurveyOptions(options);
        }

        postRepository.save(post);

        PostResponse postResponse = postMapper.toPostResponse(post);

        if (imagePosts != null) {
            postResponse.setImagePostResponses(imagePostMapper.toImagePostResponse(imagePosts));
        }

        return postResponse;
    }


    @Override
    public PostResponse updatePost(String postId , PostUpdateRequest request) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        postMapper.updatePost(post, request); //mapstruct map các trường kia

        List<ImagePost> imagePosts = mapMultipartFilesToImagePosts(request.getImagePosts(), post);
        if (imagePosts != null) {
            post.setImagePosts(imagePosts);
        }
        //Ngta đã chọn rồi nên phải xóa surveyoption cũ luôn
        if (post.getType() == TypePost.SURVEY && request.getSurveyOptions() != null) {
            // Xóa options cũ
            surveyOptionRepository.deleteAll(surveyOptionRepository.findByPost(post));

            // Thêm options mới
            List<SurveyOption> options = request.getSurveyOptions().stream()
                    .map(opt -> SurveyOption.builder()
                            .post(post)
                            .optionText(opt)
                            .build())
                    .toList();
            surveyOptionRepository.saveAll(options);
        }
        postRepository.save(post);
        PostResponse postResponse = postMapper.toPostResponse(post);
        if (imagePosts != null) {
            postResponse.setImagePostResponses(imagePostMapper.toImagePostResponse(imagePosts));
        }
        return  postResponse;
    }

    @Override
    public void deletePost(String postId) {
        postRepository.deleteById(postId);
    }

    @Override
    public PostResponse getPostReponseById(String id) {

        return postMapper.toPostResponse(postRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND)));

    }

    @Override
    public Page<PostResponse> getAllPost(Pageable pageable) {
        return postRepository.getAllPost(pageable).map(post -> {
            PostResponse res = postMapper.toPostResponse(post);
            if (post.getType() == TypePost.SURVEY) {
                List<SurveyOption> options = surveyOptionRepository.findByPost(post);
                res.setSurveyOptions(options.stream().map(opt -> {
                    long voteCount = surveyVoteRepository.countByOption(opt);
                    return new SurveyOptionResponse(opt.getId(), opt.getOptionText(), voteCount);
                }).toList());
            }
            return res;
        });
    }

    @Override
    public void voteSurveyOption(String optionId, String userId) {
        SurveyOption option = surveyOptionRepository.findById(optionId)
                .orElseThrow(() -> new AppException(ErrorCode.SURVEY_OPTION_NOT_FOUND));

        //Mỗi người 1 vote
        SurveyVoteId id = new SurveyVoteId(userId, optionId);
        if (surveyVoteRepository.existsById(id)) {
            throw new AppException(ErrorCode.ALREADY_VOTED);
        }
        SurveyVote vote = SurveyVote.builder()
                .id(id)
                .user(userRepository.findById(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS)))
                .option(option)
                .votedAt(Instant.now())
                .build();

        surveyVoteRepository.save(vote);
    }

    @Override
    public Page<PostResponse> getVisiblePosts(String currentUserId, Pageable pageable) {
        List<String> friendIds = friendRepository.findAcceptedFriends(currentUserId).stream()
                .map(f -> f.getFirstUser().getId().equals(currentUserId)
                        ? f.getSecondUser().getId()
                        : f.getFirstUser().getId())
                .toList();

        Page<Post> posts = postRepository.findVisiblePosts(currentUserId, friendIds, pageable);
        return posts.map(post -> {
            PostResponse res = postMapper.toPostResponse(post);
            if (post.getType() == TypePost.SURVEY) {
                List<SurveyOption> options = surveyOptionRepository.findByPost(post);
                res.setSurveyOptions(options.stream().map(opt -> {
                    long voteCount = surveyVoteRepository.countByOption(opt);
                    return new SurveyOptionResponse(opt.getId(), opt.getOptionText(), voteCount);
                }).toList());
            }
            return res;
        });
    }

    @Override
    public Page<PostResponse> getPublicNormalDoctorPostsOrderByReactions(Pageable pageable) {
        return postRepository.findPublicNormalDoctorPostsOrderByReactionCount(pageable)
                .map(postMapper::toPostResponse);
    }

}
