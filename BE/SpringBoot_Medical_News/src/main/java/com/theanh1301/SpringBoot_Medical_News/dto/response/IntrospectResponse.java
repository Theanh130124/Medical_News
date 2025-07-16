package com.theanh1301.SpringBoot_Medical_News.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
//Ktra đăng nhập thành công hay chưa
public class IntrospectResponse {
    boolean valid;
}
