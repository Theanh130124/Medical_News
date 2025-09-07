package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FriendResponse;
import com.theanh1301.SpringBoot_Medical_News.service.FriendService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiFriendController {

    FriendService friendService;
    PaginationProperties paginationProperties;

    //Người first gửi người second
    @PostAuthorize("returnObject.result.firstUserId.username == authentication.name")
    @PostMapping
    public ApiResponse<FriendResponse> sendRequest(@RequestBody FriendCreationRequest request){
        var res = friendService.sendRequest(request);
        return ApiResponse.<FriendResponse>builder().result(res).message("Gửi lời mời kết bạn thành công").build();
    }

    //ng second chấp nhận
    @PostAuthorize("returnObject.result.secondUserId.username == authentication.name")
    @PatchMapping("/{firstUserId}/{secondUserId}")
    public ApiResponse<FriendResponse> updateStatus(@RequestBody FriendUpdateRequest request,
                                                    @PathVariable String firstUserId,
                                                    @PathVariable String secondUserId) {
        var res = friendService.updateRequest(request,firstUserId, secondUserId);
        return ApiResponse.<FriendResponse>builder().result(res).message("Cập nhật trạng thái thành công").build();
    }
    @GetMapping("/{userId}/sent-requests")
    public ApiResponse<Page<FriendResponse>> getSentRequests(
            @PathVariable String userId,
            Pageable pageable
    ) {
        return ApiResponse.<Page<FriendResponse>>builder()
                .result(friendService.getSentRequests(userId, pageable))
                .build();
    }

    //Người first hoặc second có thể hủy
    @PreAuthorize(
            "@friendServiceImpl.getFriendResponseById(#firstUserId, #secondUserId).firstUserId.username == authentication.name" +
                    " or " +
                    "@friendServiceImpl.getFriendResponseById(#firstUserId, #secondUserId).secondUserId.username == authentication.name"
    )
    @DeleteMapping("/{firstUserId}/{secondUserId}")
    public ApiResponse<Void> deleteFriend(@PathVariable String firstUserId,
                                          @PathVariable String secondUserId) {
        friendService.deleteFriend(firstUserId, secondUserId);
        return ApiResponse.<Void>builder().message("Đã xóa kết bạn thành công").build();
    }

    @PostAuthorize("@friendServiceImpl.canAccessListFriend(returnObject.result,authentication.name)")
    @GetMapping("/{userId}")
    public ApiResponse<Page<FriendResponse>> getFriends(@PathVariable String userId,
                                                        @RequestParam(required = false) Integer size,
                                                        @RequestParam(required = false) Integer page) {
        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        return ApiResponse.<Page<FriendResponse>>builder()
                .result(friendService.getFriends(userId, pageable))
                .message("Danh sách bạn bè")
                .build();
    }

    //Xem là dùng của secondUser
    @PostAuthorize("@friendServiceImpl.canAccessFriend(returnObject.result,authentication.name)")
    @GetMapping("/pending/{userId}")
    public ApiResponse<Page<FriendResponse>> getPendingRequests(@PathVariable String userId,
                                             @RequestParam(required = false) Integer size,
                                             @RequestParam(required = false) Integer page) {
        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        return ApiResponse.<Page<FriendResponse>>builder()
                .result(friendService.getPendingRequests(userId, pageable))
                .message("Danh sách lời mời kết bạn")
                .build();
    }


}
