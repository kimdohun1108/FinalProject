package com.example.demo;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocket
public class WebsocketConfig implements WebMvcConfigurer, WebSocketConfigurer {
	
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**") // 모든 엔드포인트에서 CORS 설정
				//.allowedOrigins("http://localhost:3000")
				.allowedOrigins("http://223.130.139.215:3000") //react 주소
				.allowedMethods("GET","POST","PUT","DELETE","OPTIONS")// 허용할 HTTP 메서드
				.allowedHeaders("*") //적용할 헤더
				.allowCredentials(true);
	}
	
	 @Override
	 public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		 registry.addHandler(new ChatWebSocketHandler(), "/ws/chat")
	             .setAllowedOrigins("http://localhost:3000") // React 앱 주소
	             .addInterceptors(new HttpSessionHandshakeInterceptor());
	 }	
}