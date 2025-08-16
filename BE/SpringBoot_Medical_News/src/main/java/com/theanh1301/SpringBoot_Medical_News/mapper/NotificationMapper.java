package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.response.NotificationResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificationMapper {
    @Mapping(source = "user", target = "userResponse")
    NotificationResponse toNotificationResponse(Notification notification);
}
