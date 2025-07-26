package com.theanh1301.SpringBoot_Medical_News.service.impl;


import com.theanh1301.SpringBoot_Medical_News.repository.PermissionRepository;
import com.theanh1301.SpringBoot_Medical_News.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor // thay thế @Autowired -> Constructor injection(tiêm) ->
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)// thay thế  @Autowired -> bắt buộc final (phải truyền và không đc thay đổi)
public class PermissionServiceImpl implements PermissionService {


    PermissionRepository permissionRepository;


}
