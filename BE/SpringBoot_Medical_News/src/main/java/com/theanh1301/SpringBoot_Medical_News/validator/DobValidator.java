package com.theanh1301.SpringBoot_Medical_News.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;


//Annotaion validate và fileds validate
public class DobValidator implements ConstraintValidator<DobConstraint, LocalDate> {


    private int min;

    //Ktra data có đúng không
    @Override
    public boolean isValid(LocalDate localDate, ConstraintValidatorContext constraintValidatorContext) {
        if (localDate == null) {
            return true; //không có giá trị nào côi hợp lệ
        }
        //So sánh vs ngày hiện tại
        long age = ChronoUnit.YEARS.between( localDate , LocalDate.now());

        return age >= min; // >= true , < false
    }


    //Lấy ra fields từ DobValidator -> custom bên DobConstraint
    @Override
    public void initialize(DobConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        min = constraintAnnotation.min(); //lấy min từ anntation

    }
}
