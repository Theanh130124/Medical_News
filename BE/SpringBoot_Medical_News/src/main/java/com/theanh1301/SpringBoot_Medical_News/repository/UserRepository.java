package com.theanh1301.SpringBoot_Medical_News.repository;


import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.Optional;

public interface UserRepository extends JpaRepository<User,String> {

    boolean existsByUsername(String username); // jpa tự viết truy vấn -> chi tiet xem ở target
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phone);
    Optional<User> findByUsername(String username); //Phải tự xử lý trường hợp null
    Optional<User> getUserByUsername(String username);


    //Check warning
    @Query("SELECT u FROM User u")
    Page<User> getAllUsers(Pageable pageable);

    //Page đã là LIST
    @Query("SELECT u FROM User u where u.isActive is true")
    Page<User> findAllUserIsActive(Pageable pageable);

    @Query("SELECT count(u) from User u")
    long countAllUser();

    @Query("SELECT  Count(u) from  User u where u.isActive")
    long countUserIsActive();

    Page<User> getUserByRole(Role role, Pageable pageable);
}
