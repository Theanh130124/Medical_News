package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorSearchRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.enums.Gender;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.service.UserService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
public class DoctorController {

    UserService userService;
    PaginationProperties paginationProperties;
//Nên code hiển thị các tài khoản hiện có nữa  -> Chưa in được valid

    //Form create
    @GetMapping("/create_doctor")
    public String formCreateDoctor(Model model) {
        if(!model.containsAttribute("user")){ // nếu có user rồi thì không set form lại rỗng
            model.addAttribute("user", new UserCreationRequest()); //-> do dùng th:object nên cần
        }
        model.addAttribute("genders" ,Gender.values());
        return "createdoctor";
    }


    @PostMapping("/create_doctor")
    public String createDoctor(@ModelAttribute("user") @Valid UserCreationRequest request ,
                               BindingResult bindingResult,
                               RedirectAttributes redirectAttributes, Model model) {

        if (bindingResult.hasErrors()) { //ktra tạo có đúng @Valid không
            model.addAttribute("user",request); //vẫn giữ lại data -> trên form dù có lỗi
            return "createdoctor";
        }
        try{
            request.setRole(RoleName.DOCTOR);
            userService.createUser(request);
            redirectAttributes.addFlashAttribute("success", true);
            return "redirect:/create_doctor"; //redirect là phải trả về  đúng /create_doctor của Post
        }catch(AppException e){
            model.addAttribute("error",e.getMessage()); //lấy msg của mình ra
            return "createdoctor";
        }
    }


    @GetMapping("/doctors")
    public String listDoctors(@ModelAttribute("search") DoctorSearchRequest request, Model model
            ,@RequestParam(required = false) Integer page,
                              @RequestParam(required = false) Integer size) {

        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);


        Page<UserResponse> doctorPage;
        //isEmpty tự thêm
        if (request.isEmpty()) {
            doctorPage = userService.getUserByRole(RoleName.DOCTOR, pageable); // load tất cả
        } else {
            doctorPage = userService.searchDoctors(request, pageable); // có lọc
        }
        model.addAttribute("doctorPage",doctorPage);
        model.addAttribute("search", new DoctorSearchRequest());
        return "doctors";
    }


    @GetMapping("/doctors/edit/{id}")
    public String editDoctorForm(@PathVariable String id, Model model){


        UserUpdateRequest request = userService.getUserUpdateRequestById(id);
        //Lấy ra data của user theo id -> và phải là UserUpdateRequest vì khi edit cần @Valid
        model.addAttribute("doctor",request);
        model.addAttribute("genders" ,Gender.values());
        return "editdoctor";
    }


    @PostMapping("/doctors/edit/{id}")
    public String editDoctor(@PathVariable String id, @ModelAttribute("doctor") @Valid UserUpdateRequest request,
                             BindingResult bindingResult, RedirectAttributes redirectAttributes, Model model) {

        model.addAttribute("genders" ,Gender.values());
        if (bindingResult.hasErrors()) { //ktra tạo có đúng @Valid không
            model.addAttribute("doctor", request);  //phải là request vì có @Size...
            System.out.println("Có lỗi: " + bindingResult.getAllErrors());
            return "editdoctor";
        }
        //Thực hiện update
        try{
            userService.updateUser(id, request);
            redirectAttributes.addFlashAttribute("success", true);
            return "redirect:/doctors";
        }catch(AppException e){
            model.addAttribute("error",e.getMessage());
            return "editdoctor";
        }
    }

    //delete trên form cũng xử  lý post
    @PostMapping("/doctors/delete/{id}")
    public String deleteDoctor(@PathVariable String id, RedirectAttributes redirectAttributes) {
        try{
            userService.deleteUserById(id);
            redirectAttributes.addFlashAttribute("success", "Xóa thành công !");

        }catch(AppException e){
            redirectAttributes.addFlashAttribute("error",e.getMessage());
        }
        return "redirect:/doctors";
    }




}
