package com.theanh1301.SpringBoot_Medical_News.service;


import com.theanh1301.SpringBoot_Medical_News.repository.InvalidatedTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvalidatedTokenCleaner {

    InvalidatedTokenRepository invalidatedTokenRepository;


    @Scheduled(fixedRateString = "${token.cleaner.fixedRate}") // 2 tiếng
    public void cleanExpiredTokens() {
        Date now = new Date();
        int deleted = invalidatedTokenRepository.deleteInvalidatedTokenByExpiryTimeBefore(now);
        log.info("Đã xóa {} token hết hạn khỏi bảng invalidatedToken" , deleted);

    }
}
