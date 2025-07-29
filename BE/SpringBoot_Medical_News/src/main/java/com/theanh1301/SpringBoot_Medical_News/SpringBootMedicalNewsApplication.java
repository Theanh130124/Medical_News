package com.theanh1301.SpringBoot_Medical_News;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching //Bât annotation cache
public class SpringBootMedicalNewsApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringBootMedicalNewsApplication.class, args);
	}

}
