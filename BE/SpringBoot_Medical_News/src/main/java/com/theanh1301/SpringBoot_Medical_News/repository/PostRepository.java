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

}
