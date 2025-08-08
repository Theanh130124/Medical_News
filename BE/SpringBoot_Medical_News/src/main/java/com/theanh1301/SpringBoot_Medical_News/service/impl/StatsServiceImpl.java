package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.request.StatsRequest;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.StatsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatsServiceImpl implements StatsService {


    UserRepository userRepository;



    private void validateRequest(StatsRequest request) {
        if ((request.getMonth() != null || request.getQuarter() != null) && request.getYear() == null) {
            throw new IllegalArgumentException("Nếu chọn tháng hoặc quý thì bắt buộc phải có năm");
        }
        if (request.getYear() != null && request.getMonth() != null && request.getQuarter() != null) {
            throw new IllegalArgumentException("Không thể lọc cả tháng và quý cùng lúc");
        }
    }

    @Override
    public Page<User> findUsersByStats(Pageable pageable, StatsRequest request) {
        validateRequest(request);
        return userRepository.findUsersByStats(pageable,request.getMonth(),request.getQuarter(),request.getYear());
    }

    @Override
    public List<Object[]> countUsersStats(StatsRequest request) {
        validateRequest(request);
        return userRepository.countUsersStats(request.getMonth(),request.getQuarter(),request.getYear());
    }
}
