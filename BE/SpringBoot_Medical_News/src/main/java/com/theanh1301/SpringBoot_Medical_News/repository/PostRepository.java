package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {


    @Query("SELECT p FROM Post p")
    Page<Post> getAllPost(Pageable pageable);

    @Query("""
        SELECT p
        FROM Post p
        WHERE p.user.id = :userId
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findPostsByUserId(@Param("userId") String userId, Pageable pageable);



    @Query("SELECT FUNCTION('YEAR', p.createdAt), " +
            "FUNCTION('QUARTER', p.createdAt), " +
            "FUNCTION('MONTH', p.createdAt), " +
            "COUNT(p) " +
            "FROM Post p " +
            "WHERE (:year IS NULL OR FUNCTION('YEAR', p.createdAt) = :year) " +
            "AND (:quarter IS NULL OR FUNCTION('QUARTER', p.createdAt) = :quarter) " +
            "AND (:month IS NULL OR FUNCTION('MONTH', p.createdAt) = :month) " +
            "GROUP BY FUNCTION('YEAR', p.createdAt), " +
            "FUNCTION('QUARTER', p.createdAt), " +
            "FUNCTION('MONTH', p.createdAt) " +
            "ORDER BY FUNCTION('YEAR', p.createdAt) ASC, FUNCTION('MONTH', p.createdAt) ASC"
    )
    List<Object[]> countPostStats(@Param("month") Integer month,
                                  @Param("quarter") Integer quarter,
                                  @Param("year") Integer year);

    @Query("SELECT p from Post p WHERE " +
            "(:year IS NULL OR FUNCTION('YEAR' , p.createdAt) =:year )" +
            "AND (:quarter IS NULL OR FUNCTION('QUARTER' , p.createdAt) =:quarter )" +
            "AND (:month IS NULL OR FUNCTION('MONTH' ,p.createdAt) =:month )" +
            "ORDER BY p.createdAt DESC ")
    Page<Post> findPostsByStats(Pageable pageable,
                                @Param("month") Integer month,
                                @Param("quarter") Integer quarter,
                                @Param("year") Integer year);

    //Dùng subquery -> thay vì join (join tạo nhiều bản ghi tạm chậm)
    @Query("SELECT p, " +
            "(SELECT COUNT(c) FROM Comment c WHERE c.post = p), " +
            "(SELECT COUNT(r) FROM Reaction r WHERE r.post = p) " +
            "FROM Post p WHERE p = :post")
    Object[] getCommentAndReactionCountByPost(@Param("post") Post post);


    @Query("""
            SELECT p FROM Post p
            WHERE p.visibility = com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost.PUBLIC
               OR (p.visibility = com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost.FRIENDS_ONLY
                   AND p.user.id IN :friendIds)
               OR (p.visibility = com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost.PRIVATE
                   AND p.user.id = :currentUserId)
            ORDER BY p.createdAt DESC
            """)
    Page<Post> findVisiblePosts(@Param("currentUserId") String currentUserId,  @Param("friendIds") List<String> friendIds,
            Pageable pageable);



    @Query("""
    SELECT p
    FROM Post p
    LEFT JOIN Reaction r ON r.post = p
    WHERE p.visibility = com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost.PUBLIC
      AND p.type = com.theanh1301.SpringBoot_Medical_News.enums.TypePost.NORMAL
      AND p.user.role.name = 'DOCTOR'
    GROUP BY p
    ORDER BY COUNT(r) DESC
    """)
    Page<Post> findPublicNormalDoctorPostsOrderByReactionCount(Pageable pageable);


    @Query("""
    SELECT p
    FROM Post p
    WHERE p.user.id = :userId
    AND p.visibility = com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost.PUBLIC
    ORDER BY p.createdAt DESC
    """)
    Page<Post> findPublicPostsByUserId(@Param("userId") String userId, Pageable pageable);
}
