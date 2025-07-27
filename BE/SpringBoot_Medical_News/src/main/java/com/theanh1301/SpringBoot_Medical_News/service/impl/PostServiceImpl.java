package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ImagePostResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.ImagePost;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.ImagePostMapper;
import com.theanh1301.SpringBoot_Medical_News.mapper.PostMapper;
import com.theanh1301.SpringBoot_Medical_News.mapper.UserMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.ImagePostRepository;
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
    UserMapper userMapper;
    Cloudinary cloudinary;
    ImagePostMapper imagePostMapper;

    @Override
    public PostResponse createPost(PostCreationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        Post post = postMapper.toPost(request);
        post.setUser(user);

        List<MultipartFile> files = request.getImagePosts();
        List<ImagePost> imagePosts = null; // để dùng imagePosts ngoài scope
        if(files != null && !files.isEmpty() ) {
            imagePosts = files
                    .stream().map(file -> {
                        try {
                            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                                    ObjectUtils.asMap("resource_type", "auto"));
                            //Lưu qua imagePost
                            return ImagePost.builder().postImageUrl(uploadResult.get("secure_url").toString()).post(post).build();

                        } catch (IOException e) {
                            throw new RuntimeException("Tải ảnh bài viết thất bại", e);
                        }
                    }).collect(Collectors.toList());

            post.setImagePosts(imagePosts);
        }
        postRepository.save(post);

        //Tự map lại thành userResponse để trả về trong PostResponse(Tự map)
        PostResponse postResponse = postMapper.toPostResponse(post);
        postResponse.setUserResponse(userMapper.toUserResponse(user));

        if(imagePosts !=null){
            List<ImagePostResponse> imagePostResponseList = imagePostMapper.toImagePostResponse(imagePosts); //1 ảnh nhưng map dto
            postResponse.setImagePostResponses(imagePostResponseList); // trả nhiều ảnh
        }
        return  postResponse;
    }
}
