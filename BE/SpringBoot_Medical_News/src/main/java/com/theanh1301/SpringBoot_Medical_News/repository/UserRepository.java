package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,String> {

    boolean existsByUsername(String username); // jpa tự viết truy vấn -> chi tiet xem ở target
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phone);
    Optional<User> findByUsername(String username); //Phải tự xử lý trường hợp null
    Optional<User> getUserByUsername(String username);

    @Query("SELECT u FROM User u where u.isActive is true")
    List<User> findAllUserIsActive();

    @Query("SELECT count(u) from User u")
    long countAllUser();

    @Query("SELECT  Count(u) from  User u where u.isActive")
    long countUserIsActive();
}
