package com.theanh1301.SpringBoot_Medical_News.repository;


import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorSearchRequest;
import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


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


    //nếu không null thì -> lower(u.fields) LIKE với req -> nếu null thì true (bỏ qua)
    @Query("SELECT u FROM User u " +
            "WHERE (:#{#req.username} IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :#{#req.username}, '%'))) " +
            "AND (:#{#req.firstName} IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :#{#req.firstName}, '%'))) " +
            "AND (:#{#req.lastName} IS NULL OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :#{#req.lastName}, '%'))) " +
            "AND (:#{#req.email} IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :#{#req.email}, '%'))) " +
            "AND (:#{#req.phoneNumber} IS NULL OR u.phoneNumber LIKE CONCAT('%', :#{#req.phoneNumber}, '%')) " +
            "AND (:#{#req.dateOfBirth} IS NULL OR FUNCTION('DATE_FORMAT', u.dateOfBirth, '%Y-%m-%d') LIKE CONCAT('%', :#{#req.dateOfBirth}, '%')) " +
            "AND (:#{#req.address} IS NULL OR LOWER(u.address) LIKE LOWER(CONCAT('%', :#{#req.address}, '%'))) " +
            "AND u.role.name = 'DOCTOR'")
    Page<User> searchDoctors(@Param("req") User req, Pageable pageable);

}
