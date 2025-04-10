package IDP_H1.FactuStock.DTO;

import IDP_H1.FactuStock.Entities.Organizacion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizacionDTO {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String nifCif;
    private String web;
    private String email;
    private String logo;
    private String IBAN;

    public static OrganizacionDTO fromEntity(Organizacion organizacion) {
        OrganizacionDTO dto = new OrganizacionDTO();
        dto.setId(organizacion.getId());
        dto.setNombre(organizacion.getNombre());
        dto.setDireccion(organizacion.getDireccion());
        dto.setTelefono(organizacion.getTelefono());
        dto.setNifCif(organizacion.getNifCif());
        dto.setWeb(organizacion.getWeb());
        dto.setEmail(organizacion.getEmail());
        dto.setLogo(organizacion.getLogo());
        dto.setIBAN(organizacion.getIBAN());
        return dto;
    }
}
