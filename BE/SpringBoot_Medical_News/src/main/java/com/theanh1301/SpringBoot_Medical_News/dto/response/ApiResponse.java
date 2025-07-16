package com.theanh1301.SpringBoot_Medical_News.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

//Normalize lại API


@JsonInclude(JsonInclude.Include.NON_NULL) // đôi khi set hết value (nên cái nào null thì bỏ qua khỏi json)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiResponse<T> {

    int code = 9999 ;
    String message;
    T result; //generic -> truyền fiedl nào cũng đc

}
