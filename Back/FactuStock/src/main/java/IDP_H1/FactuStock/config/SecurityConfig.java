package IDP_H1.FactuStock.config;

import IDP_H1.FactuStock.Jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig implements WebMvcConfigurer {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")  // Actualiza el origen si es necesario
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);  // Permitir cookies o credenciales si es necesario
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors().and()
                .csrf().disable()  // Desactivar CSRF, ya que usas JWT
                .authorizeRequests(auth -> auth
                        .requestMatchers("/auth/login", "/auth/register").permitAll()  // Rutas públicas de login y registro
                        .requestMatchers("/api/public/**").permitAll()  // Otros endpoints públicos si los necesitas
                        .requestMatchers("/auth/**", "/usuarios/forgot-password", "/usuarios/reset-password").permitAll()  // Rutas de recuperación de contraseña
                        .requestMatchers("/organizaciones/logo/**").permitAll()  // Archivos de logos sin autenticación
                        .requestMatchers("/img-logo/**").permitAll()  // Archivos de imágenes sin autenticación
                        .anyRequest().authenticated()  // Resto de las rutas requieren autenticación
                )
                .authenticationProvider(authenticationProvider)  // Usar el provider de autenticación personalizado
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)  // Agregar el filtro JWT
                .sessionManagement().disable();  // Deshabilitar la gestión de sesión, ya que usas JWT

        return http.build();
    }
}
