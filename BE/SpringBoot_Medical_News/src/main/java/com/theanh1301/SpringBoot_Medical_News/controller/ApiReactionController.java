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
import org.springframework.web.bind.annotation.*;

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
    @PatchMapping("/{reactionId}")
    public ApiResponse<ReactionResponse> updateReaction(@RequestBody @Valid ReactionUpdateRequest request , @PathVariable(value ="reactionId" ) String id  ){
        var res = reactionService.updateReaction(id,request);
        return ApiResponse.<ReactionResponse>builder().result(res).build();
    }

    @DeleteMapping("/{reactionId}")
    public ApiResponse<Void> deleteReaction(@PathVariable(value = "reactionId") String id){
        reactionService.deleteReaction(id);
        return ApiResponse.<Void>builder().build();
    }






}
