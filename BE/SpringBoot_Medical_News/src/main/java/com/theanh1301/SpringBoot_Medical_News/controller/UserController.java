package com.theanh1301.SpringBoot_Medical_News.controller;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserController {


    @GetMapping("/login")
    public String loginView(HttpServletRequest request , Model model) {
        model.addAttribute("currentUri", request.getRequestURI());
        return "login";
    }
}
