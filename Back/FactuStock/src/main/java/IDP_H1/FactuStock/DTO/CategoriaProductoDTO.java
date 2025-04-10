package IDP_H1.FactuStock.DTO;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoriaProductoDTO {
    private Long id;
    private String nombre;
    private Long organizacionId;

    public static CategoriaProductoDTO fromEntity(CategoriaProducto categoria) {
        CategoriaProductoDTO dto = new CategoriaProductoDTO();
        dto.setId(categoria.getId());
        dto.setNombre(categoria.getNombre());
        dto.setOrganizacionId(categoria.getOrganizacion() != null ? categoria.getOrganizacion().getId() : null);
        return dto;
    }
}
