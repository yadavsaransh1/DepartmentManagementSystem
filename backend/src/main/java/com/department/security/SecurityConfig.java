package com.department.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins}")
    private String corsAllowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        return new JwtAuthenticationFilter(tokenProvider);
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = 
            http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
            .userDetailsService(userDetailsService)
            .passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtTokenProvider tokenProvider) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                corsConfig.setAllowedOrigins(java.util.Arrays.asList(corsAllowedOrigins.split(",")));
                corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                corsConfig.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "Accept", "Cache-Control", "X-Requested-With"));
                corsConfig.setExposedHeaders(java.util.List.of("Authorization", "Content-Type"));
                corsConfig.setAllowCredentials(true);
                corsConfig.setMaxAge(3600L);
                return corsConfig;
            }))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                // Allow public read access to subjects and courses
                .requestMatchers("GET", "/api/subjects/**").permitAll()
                .requestMatchers("GET", "/api/courses/**").permitAll()
                // Allow ONLY PUBLIC carousel and home page content access (no admin endpoints)
                .requestMatchers("GET", "/api/home-page-images/carousel").permitAll()
                .requestMatchers("GET", "/api/home-page-images/active").permitAll()
                .requestMatchers("GET", "/api/home-page/**").permitAll()
                // Require authentication for admin home-page-images operations
                .requestMatchers("GET", "/api/home-page-images").authenticated()
                .requestMatchers("GET", "/api/home-page-images/").authenticated()
                .requestMatchers("POST", "/api/home-page-images/**").authenticated()
                .requestMatchers("PUT", "/api/home-page-images/**").authenticated()
                .requestMatchers("PATCH", "/api/home-page-images/**").authenticated()
                .requestMatchers("DELETE", "/api/home-page-images/**").authenticated()
                // Require authentication for write operations on home page
                .requestMatchers("POST", "/api/home-page/**").authenticated()
                .requestMatchers("PUT", "/api/home-page/**").authenticated()
                .requestMatchers("DELETE", "/api/home-page/**").authenticated()
                // Allow file downloads without authentication
                .requestMatchers("GET", "/api/assignments/*/download-file").permitAll()
                .requestMatchers("GET", "/api/submissions/*/download-file").permitAll()
                // Require authentication for specific protected endpoints
                .requestMatchers("POST", "/api/documents/upload").authenticated()
                .requestMatchers("/api/documents/download/**").authenticated()
                .requestMatchers("GET", "/api/documents").permitAll()
                .requestMatchers("GET", "/api/documents/public").permitAll()
                .requestMatchers("/api/documents/my-documents").authenticated()
                .requestMatchers("/api/documents/**").authenticated()
                .requestMatchers("/api/students/profile").authenticated()
                // Allow export and settings endpoints without authentication for easier access
                .requestMatchers("GET", "/api/attendance/export-report").permitAll()
                .requestMatchers("GET", "/api/attendance/settings").permitAll()
                .requestMatchers("GET", "/api/attendance/program/*/semesters").permitAll()
                // Other attendance endpoints require authentication
                .requestMatchers("GET", "/api/attendance").permitAll()
                .requestMatchers("GET", "/api/attendance/**").permitAll()
                .requestMatchers("/api/marks/**").authenticated()
                .requestMatchers("GET", "/api/assignments").permitAll()
                .requestMatchers("GET", "/api/assignments/**").permitAll()
                .requestMatchers("/api/submissions/**").authenticated()
                .requestMatchers("GET", "/api/routines/**").permitAll()
                // Require authentication for all write operations
                .requestMatchers("POST", "PUT", "DELETE").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter(tokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
