package com.example.demo;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
	
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**") // 모든 엔드포인트에서 CORS 설정
				.allowedOrigins("http://localhost:3000") //react 주소
				.allowedMethods("GET","POST","PUT","DELETE","OPTIONS")// 허용할 HTTP 메서드
				.allowedHeaders("*") //적용할 헤더
				.allowCredentials(true);
	}
}
