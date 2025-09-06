package com.theanh1301.SpringBoot_Medical_News.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.StatsRequest;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.service.PostService;
import com.theanh1301.SpringBoot_Medical_News.service.StatsService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
public class StatsController {

    StatsService statsService;
    PaginationProperties paginationProperties;
    PostService postService;

    @GetMapping("/stats")
    public String statsForm(@ModelAttribute("statsRequest") StatsRequest statsRequest,
                            Model model,
                            @RequestParam(required = false) Integer page,
                            @RequestParam(required = false) Integer size) throws Exception {
        try {
            Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
            ObjectMapper mapper = new ObjectMapper();

            if ("post".equals(statsRequest.getType())) {

                Page<Post> posts = statsService.findPostsByStats(pageable, statsRequest);
                List<Object[]> postStats = statsService.countPostStats(statsRequest);

                model.addAttribute("posts", posts);
                model.addAttribute("statsPostJson", mapper.writeValueAsString(postStats));
                model.addAttribute("statsUserJson", "[]"); // để tránh null bên view
            } else {

                Page<User> users = statsService.findUsersByStats(pageable, statsRequest);
                List<Object[]> userStats = statsService.countUsersStats(statsRequest);

                model.addAttribute("users", users);
                model.addAttribute("statsUserJson", mapper.writeValueAsString(userStats));
                model.addAttribute("statsPostJson", "[]"); // để tránh null bên view
            }
        } catch (AppException e) {

            model.addAttribute("errorMessage", e.getErrorCode().getMsg());
            model.addAttribute("users", Page.empty());
            model.addAttribute("posts", Page.empty());
            model.addAttribute("statsUserJson", "[]");
            model.addAttribute("statsPostJson", "[]");
        }
        return "stats";





}
    @GetMapping("/posts/{id}")
    public String getPostDetail(@PathVariable String id, Model model) {
        Post post = postService.getPostById(id); // hoặc postService nếu bạn có
        model.addAttribute("post", post);
        return "post-detail"; // view mới
    }

}
