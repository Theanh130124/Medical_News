package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.ReactionCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.ReactionUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ReactionResponse;
import com.theanh1301.SpringBoot_Medical_News.service.ReactionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/reactions")
public class ApiReactionController {

    ReactionService reactionService;


    @PostMapping
    public ApiResponse<ReactionResponse> createReaction(@RequestBody @Valid ReactionCreationRequest request){
        var res = reactionService.createReaction(request);
        return ApiResponse.<ReactionResponse>builder().result(res).build();

    }

    @PostAuthorize("returnObject.result.userResponse.username == authentication.name")
    @PatchMapping("/{reactionId}")
    public ApiResponse<ReactionResponse> updateReaction(@RequestBody @Valid ReactionUpdateRequest request , @PathVariable(value ="reactionId") String id  ){
        var res = reactionService.updateReaction(id,request);
        return ApiResponse.<ReactionResponse>builder().result(res).build();
    }


    @PreAuthorize("@reactionServiceImpl.getReactionById(#id).userResponse.username == authentication.name")
    @DeleteMapping("/{reactionId}")
    public ApiResponse<Void> deleteReaction(@PathVariable(value = "reactionId") String id){
        reactionService.deleteReaction(id);
        return ApiResponse.<Void>builder().build();
    }

    //Thêm res count
    @GetMapping("/byPostId/{postId}")
    public ApiResponse<List<ReactionResponse>> getAllReactionByPost(@PathVariable(value = "postId") String id){
        var res = reactionService.getAllReactionsByPost(id);
        long count = reactionService.countReactionByPost(id);
        return ApiResponse.<List<ReactionResponse>>builder().result(res).count(count).message("Lấy tất cả reaction của một bài viết thành công").build();
    }









}
