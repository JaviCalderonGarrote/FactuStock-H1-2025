package IDP_H1.FactuStock.DTO;

import IDP_H1.FactuStock.Entities.CategoriaGasto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoriaGastoDTO {
    private Long id;
    private String nombre;
    private Long organizacionId;

    public static CategoriaGastoDTO fromEntity(CategoriaGasto categoria) {
        CategoriaGastoDTO dto = new CategoriaGastoDTO();
        dto.setId(categoria.getId());
        dto.setNombre(categoria.getNombre());
        dto.setOrganizacionId(categoria.getOrganizacion() != null ? categoria.getOrganizacion().getId() : null);
        return dto;
    }
}
