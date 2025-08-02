package com.theanh1301.SpringBoot_Medical_News.utils;


import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

//Clean code
public class PaginationUtils {

    public static Pageable createPageable(Integer page, Integer size, PaginationProperties properties) {
        //nếu không truyền size hay page trên params thì dùng của default
        int pageSize = (size == null || size <= 0) ? properties.getDefaultSize() : size;
        int pageNumber = (page == null || page < 0) ? properties.getDefaultPage() : page;
        return PageRequest.of(pageNumber, pageSize);
    }
}
