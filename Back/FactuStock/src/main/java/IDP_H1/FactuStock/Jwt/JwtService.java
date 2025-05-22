package IDP_H1.FactuStock.Jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public String getToken(UserDetails user, Long idUsuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("idUsuario", idUsuario);
        return createToken(claims, user.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 horas
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return getClaim(token, Claims::getSubject);
    }

    public Long getIdUsuarioFromToken(String token) {
        return getClaim(token, claims -> claims.get("idUsuario", Long.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return getClaim(token, Claims::getExpiration).before(new Date());
    }

    public <T> T getClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            if (token == null) {
                throw new IllegalArgumentException("Token cannot be null");
            }
            final Claims claims = getAllClaims(token);
            return claimsResolver.apply(claims);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Token cannot be null", e);
        } catch (Exception e) {
            throw new RuntimeException("JWT token is invalid", e);
        }
    }
}
