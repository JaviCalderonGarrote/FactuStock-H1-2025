package IDP_H1.FactuStock.DTO;

import IDP_H1.FactuStock.Entities.Producto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductoDTO {
    private Long id;
    private String nombre;
    private Double precio;
    private Long categoriaId;
    private Integer cantidadStock;
    private BigDecimal iva;
    private Long organizacionId;

    public static ProductoDTO fromEntity(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setPrecio(producto.getPrecio());
        dto.setCategoriaId(producto.getCategoria() != null ? producto.getCategoria().getId() : null);
        dto.setCantidadStock(producto.getCantidadStock());
        dto.setIva(producto.getIva());
        dto.setOrganizacionId(producto.getOrganizacion() != null ? producto.getOrganizacion().getId() : null);
        return dto;
    }
}
