package com.theanh1301.SpringBoot_Medical_News.validator;


import com.nimbusds.jose.Payload;
import jakarta.validation.Constraint;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD}) // Trường validator
@Retention(RetentionPolicy.RUNTIME) //Annotation xử lý lúc nào
@Constraint(
        validatedBy =  {DobValidator.class}
)
public @interface DobConstraint {  //@interface -> annotation mình tự custom


    //Mấy cái annotation phải có
    String message() default "Invalid date of birth";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    //Property tự custom

    int min();

}
