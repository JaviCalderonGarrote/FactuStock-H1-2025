package IDP_H1.FactuStock.Jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // Generar el token con el ID del usuario y el nombre de usuario
    public String getToken(UserDetails user, Long idUsuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("idUsuario", idUsuario); // Agregamos el idUsuario como un claim
        return createToken(claims, user.getUsername());
    }

    // Crear el token a partir de los claims y el nombre de usuario
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)  // Establecemos los claims (idUsuario)
                .setSubject(subject) // Establecemos el nombre de usuario como el subject
                .setIssuedAt(new Date(System.currentTimeMillis())) // Fecha de emisión
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // Expira en 24 horas
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256) // Firmamos el token con la clave secreta
                .compact(); // Lo empaquetamos y lo devolvemos
    }

    // Obtener el nombre de usuario del token
    public String getUsernameFromToken(String token) {
        return getClaim(token, Claims::getSubject);  // Extraemos el subject (nombre de usuario)
    }

    // Obtener el idUsuario del token
    public Long getIdUsuarioFromToken(String token) {
        return getClaim(token, claims -> claims.get("idUsuario", Long.class)); // Extraemos el idUsuario desde los claims
    }

    // Extraer un claim del token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaims(token); // Obtenemos todos los claims
        return claimsResolver.apply(claims); // Aplicamos la función para extraer el claim deseado
    }

    // Verificar si el token es válido
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token); // Extraemos el nombre de usuario
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token)); // Comprobamos que el nombre de usuario coincida y que el token no haya expirado
    }

    // Obtener todos los claims del token
    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY) // Usamos la clave secreta para validar el token
                .build()
                .parseClaimsJws(token) // Parseamos el JWT
                .getBody(); // Extraemos los claims
    }

    // Verificar si el token ha expirado
    private boolean isTokenExpired(String token) {
        return getClaim(token, Claims::getExpiration).before(new Date()); // Comprobamos si la fecha de expiración ya ha pasado
    }

    // Obtener un claim específico
    public <T> T getClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaims(token); // Obtenemos todos los claims
        return claimsResolver.apply(claims); // Aplicamos la función para obtener el claim deseado
    }
}
