package com.theanh1301.SpringBoot_Medical_News.config;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;


//Map properties -> sang để spring xử lý
@Getter
@Setter
@Component
@FieldDefaults(level = AccessLevel.PRIVATE)
@ConfigurationProperties(prefix = "pagination") //Tìm theo tiền tố
public class PaginationProperties {
    int defaultPage;
    int defaultSize;
}
