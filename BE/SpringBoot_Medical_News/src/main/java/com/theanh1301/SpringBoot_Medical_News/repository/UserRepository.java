package com.theanh1301.SpringBoot_Medical_News.repository;


import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorSearchRequest;
import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,String> , JpaSpecificationExecutor<User> {

    boolean existsByUsername(String username); // jpa tự viết truy vấn -> chi tiet xem ở target
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phone);
    Optional<User> findByUsername(String username); //Phải tự xử lý trường hợp null
    Optional<User> getUserByUsername(String username);

    List<User> findByIsActiveTrue();
    List<User> findByRoleNameAndIsActiveTrue(RoleName roleName);
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



    @Query("SELECT FUNCTION('YEAR', u.createdAt), " +
            "FUNCTION('QUARTER', u.createdAt), " +
            "FUNCTION('MONTH', u.createdAt), " +
            "COUNT(u) " +
            "FROM User u " +
            "WHERE (:year IS NULL OR FUNCTION('YEAR', u.createdAt) = :year) " +
            "AND (:quarter IS NULL OR FUNCTION('QUARTER', u.createdAt) = :quarter) " +
            "AND (:month IS NULL OR FUNCTION('MONTH', u.createdAt) = :month) " +
            "GROUP BY FUNCTION('YEAR', u.createdAt), " +
            "FUNCTION('QUARTER', u.createdAt), " +
            "FUNCTION('MONTH', u.createdAt) " +
            "ORDER BY FUNCTION('YEAR', u.createdAt) DESC , FUNCTION('MONTH', u.createdAt) DESC"
    )
    List<Object[]> countUsersStats(@Param("month") Integer month,
                                   @Param("quarter") Integer quarter,
                                   @Param("year") Integer year);


    @Query("SELECT u from User u WHERE " +
            "(:year IS NULL OR FUNCTION('YEAR' , u.createdAt) =:year )" +
            "AND (:quarter IS NULL OR FUNCTION('QUARTER' , u.createdAt) =:quarter )" +
            "AND (:month IS NULL OR FUNCTION('MONTH' ,u.createdAt) =:month )" +
            "ORDER BY u.createdAt DESC ")
    Page<User> findUsersByStats(Pageable pageable,
                                @Param("month") Integer month,
                                @Param("quarter") Integer quarter,
                                @Param("year") Integer year);
    @Query("SELECT u FROM User u WHERE CONCAT(u.firstName, ' ', u.lastName) LIKE %:keyword%")
    Page<User> searchUserByFullName(@Param("keyword") String keyword, Pageable pageable);
}
