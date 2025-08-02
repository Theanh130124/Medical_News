package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.enums.Gender;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
public class DoctorController {

    UserService userService;
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

        if (bindingResult.hasErrors()) {
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
    public String listDoctors(Model model ,  @PageableDefault(size = 5) Pageable pageable) {

        Page<UserResponse> doctorPage = userService.getUserByRole(RoleName.DOCTOR, pageable);
        model.addAttribute("doctorPage",doctorPage);
        return "doctors";
    }

}
