package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.StatsRequest;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StatsService {

    Page<User> findUsersByStats(Pageable pageable, StatsRequest request);
    List<Object[]> countUsersStats(StatsRequest request);

}
