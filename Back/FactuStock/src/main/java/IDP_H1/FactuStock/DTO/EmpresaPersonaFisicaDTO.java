package IDP_H1.FactuStock.DTO;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Entities.TipoEmpresa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmpresaPersonaFisicaDTO {
    private Long id;
    private String nombre;
    private String nifCif;
    private String telefono;
    private String direccion;
    private String web;
    private String mail;
    private TipoEmpresa tipo;
    private Long organizacionId;

    public static EmpresaPersonaFisicaDTO fromEntity(EmpresaPersonaFisica empresa) {
        EmpresaPersonaFisicaDTO dto = new EmpresaPersonaFisicaDTO();
        dto.setId(empresa.getId());
        dto.setNombre(empresa.getNombre());
        dto.setNifCif(empresa.getNifCif());
        dto.setTelefono(empresa.getTelefono());
        dto.setDireccion(empresa.getDireccion());
        dto.setWeb(empresa.getWeb());
        dto.setMail(empresa.getMail());
        dto.setTipo(empresa.getTipo());
        dto.setOrganizacionId(empresa.getOrganizacion() != null ? empresa.getOrganizacion().getId() : null);
        return dto;
    }
}
