package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.ImagePost;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.ImagePostMapper;
import com.theanh1301.SpringBoot_Medical_News.mapper.PostMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.PostRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Transactional  // create có transaction
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
public class PostServiceImpl implements PostService {

    PostRepository postRepository;
    PostMapper postMapper;
    UserRepository userRepository;
    Cloudinary cloudinary;
    ImagePostMapper imagePostMapper;


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


        List<ImagePost> imagePosts = mapMultipartFilesToImagePosts(request.getImagePosts() , post);
        if (imagePosts != null) {
            post.setImagePosts(imagePosts);
        }

        postRepository.save(post);

        PostResponse postResponse = postMapper.toPostResponse(post);

        if (imagePosts != null) {
            postResponse.setImagePostResponses(imagePostMapper.toImagePostResponse(imagePosts));
        }
        return  postResponse;
    }

    @Override
    public PostResponse updatePost(String postId , PostUpdateRequest request) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        postMapper.updatePost(post, request); //mapstruct map các trường kia

        List<ImagePost> imagePosts = mapMultipartFilesToImagePosts(request.getImagePosts(), post);
        if (imagePosts != null) {
            post.setImagePosts(imagePosts);
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
}
