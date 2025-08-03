package com.theanh1301.SpringBoot_Medical_News.specification;

import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorSearchRequest;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;


public class UserSpecification {


    //Sẽ lọc từ findAll ra   -> public static se khong cần new contructor

    public static Specification<User> filterByRequest(DoctorSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getUsername() != null) {
                predicates.add(cb.like(cb.lower(root.get("username")), "%" + request.getUsername().toLowerCase() + "%"));
            }
            if (request.getFirstName() != null) {
                predicates.add(cb.like(cb.lower(root.get("firstName")), "%" + request.getFirstName().toLowerCase() + "%"));
            }
            if (request.getLastName() != null) {
                predicates.add(cb.like(cb.lower(root.get("lastName")), "%" + request.getLastName().toLowerCase() + "%"));
            }
            if (request.getEmail() != null) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + request.getEmail().toLowerCase() + "%"));
            }
            if (request.getPhoneNumber() != null) {
                predicates.add(cb.like(root.get("phoneNumber"), "%" + request.getPhoneNumber().toLowerCase() + "%"));
            }
            if (request.getDateOfBirth() != null) {
                predicates.add(cb.like(cb.function("DATE_FORMAT", String.class, root.get("dateOfBirth"), cb.literal("%Y-%m-%d")),
                        "%" + request.getDateOfBirth() + "%"));
            }
            if (request.getAddress() != null) {
                predicates.add(cb.like(cb.lower(root.get("address")), "%" + request.getAddress().toLowerCase() + "%"));
            }

            // lọc theo role là 'DOCTOR'
            predicates.add(cb.equal(root.get("role").get("name"), "DOCTOR"));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

    }
}
