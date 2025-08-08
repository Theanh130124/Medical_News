package com.theanh1301.SpringBoot_Medical_News.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.StatsRequest;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
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
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
public class StatsController {

    StatsService statsService;
    PaginationProperties paginationProperties;

    @GetMapping("/stats")
    public String statsForm(@ModelAttribute("statsRequest") StatsRequest statsRequest, Model model , @RequestParam(required = false) Integer page,
                            @RequestParam(required = false) Integer size)  throws Exception{
        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        Page<User> users = statsService.findUsersByStats(pageable,statsRequest);
        List<Object[]> stats = statsService.countUsersStats(statsRequest);

        ObjectMapper mapper = new ObjectMapper();
        String statsJson = mapper.writeValueAsString(stats); //Json

        model.addAttribute("users", users);
        model.addAttribute("statsJson", statsJson);
        return "stats";
    }

}
