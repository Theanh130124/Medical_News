package com.theanh1301.SpringBoot_Medical_News.converter;

import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;


//converter String DOCTOR trong form thymeleaf sang Enum
@Component
public class StringToRoleNameConverter implements Converter<String, RoleName> {

    @Override
    public RoleName convert(String source) {
        try {
            return RoleName.valueOf(source.toUpperCase());
        } catch (Exception e) {
            return null;
        }
    }
}
