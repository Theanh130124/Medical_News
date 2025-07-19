package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.Permission;

import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Set;

public interface PermissionRepository extends JpaRepository<Permission, String> {
    Set<Permission> findAllByNameIn(Set<String> names);
}
