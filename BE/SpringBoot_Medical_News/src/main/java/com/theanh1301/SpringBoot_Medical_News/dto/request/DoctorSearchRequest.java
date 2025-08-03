package com.theanh1301.SpringBoot_Medical_News.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorSearchRequest {
    String username;
    String firstName;
    String lastName;
    String email;
    String phoneNumber;
    LocalDate dateOfBirth;
    String address;

    public boolean isEmpty() {
        return username == null && firstName == null && lastName == null &&
                email == null && phoneNumber == null && dateOfBirth == null && address == null;
    }

}
