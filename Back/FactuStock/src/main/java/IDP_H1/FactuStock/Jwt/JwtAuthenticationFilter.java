package IDP_H1.FactuStock.Jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.RequiredArgsConstructor;

import java.io.IOException;

@Component
@RequiredArgsConstructor  // Lombok will generate the constructor for us
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService; // JWT service to verify token
    private final UserDetailsService userDetailsService; // User service to load user details

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String token = getTokenFromRequest(request); // Get the token from the request header

        if (token == null) {
            filterChain.doFilter(request, response); // If no token, proceed to next filter
            return;
        }

        // Extract username from token
        final String username = jwtService.getUsernameFromToken(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username); // Load user from DB

                // Validate token and user
                if (jwtService.isTokenValid(token, userDetails)) {
                    // Create the authentication token and set it in the security context
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken); // Set authentication context
                }
            } catch (Exception e) {
                // Handle exception (logging, etc.) if user not found or token is invalid
                logger.error("Error processing authentication: ", e);
            }
        }

        filterChain.doFilter(request, response); // Continue with the filter chain
    }

    // Extract token from the request header
    private String getTokenFromRequest(HttpServletRequest request) {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7); // Extract token from "Bearer <token>"
        }
        return null;
    }
}
