package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * 1️⃣ Seguridad para la API REST (/api/**) - Devuelve JSON en lugar de
     * redirigir a login. - Usa tu CustomAccessDeniedHandler y
     * CustomAuthenticationEntryPoint.
     */
    @Bean
    @Order(1)
    public SecurityFilterChain apiSecurityFilterChain(
            HttpSecurity http,
            CustomAccessDeniedHandler accessDeniedHandler,
            CustomAuthenticationEntryPoint authenticationEntryPoint) throws Exception {

        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN")
                        // Todo lo demás, requiere autenticación
                        .anyRequest().authenticated())
                .securityMatcher("/api/**")
                .exceptionHandling(ex -> ex
                        .accessDeniedHandler(accessDeniedHandler)
                        .authenticationEntryPoint(authenticationEntryPoint))
                .csrf(csrf -> csrf.disable()) // Desactiva CSRF solo para APIs
                .httpBasic(withDefaults()); // o puedes usar token si más adelante quieres JWT

        return http.build();
    }

    /**
     * Seguridad para la interfaz web (HTML) - Usa formLogin normal. - Redirige
     * al formulario de login si no estás autenticado.
     */
    @Bean
    @Order(2)
    public SecurityFilterChain formLoginFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // Recursos estáticos públicos
                        .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**", "/shared/**",
                        "/dashboard/**", "/app/**", "/departments/**", "/favicon.ico", "/fidamc.png", "/auth/**", "/forms/**")
                        .permitAll()
                        /**Añado para LOGOUT que no funcionaba */
                        .requestMatchers("/logout/**").permitAll()
                        // Páginas públicas
                        .requestMatchers("/login", "/error", "/logout-success").permitAll()
                        // Endpoints protegidos por rol
                        // .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        // Pagina de administración solo para ADMIN
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        // Ejemplo: POST a /guardar requiere login
                        .requestMatchers(HttpMethod.POST, "/guardar").authenticated()
                        .requestMatchers("/api/users/me").authenticated()

                        // Todo lo demás, requiere autenticación
                        .anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/login") // 👉 usa tu nueva página personalizada
                        .defaultSuccessUrl("/", true)
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/logout-success")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll());

        return http.build();
    }

    // Exponer AuthenticationManager para el endpoint /api/auth/token
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // UserDetailsService ya está registrado por JpaUserDetailsService (@Service),
    // Spring lo detecta.
    // Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // No explicit AuthenticationProvider bean: Spring Boot will detect the
    // JpaUserDetailsService (@Service) and PasswordEncoder beans and register
    // a DaoAuthenticationProvider automatically.
}
