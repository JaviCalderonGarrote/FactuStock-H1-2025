package IDP_H1.FactuStock.Auth;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String nombre;
    private String apellido;
    private Rol rol;
    private String password;
    private String mail;
    private Organizacion organizacion;
}
