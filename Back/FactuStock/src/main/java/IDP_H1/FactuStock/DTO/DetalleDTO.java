package IDP_H1.FactuStock.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DetalleDTO {

    private Long id;
    private Long ventaId;  // Id de la venta relacionada
    private Long productoId;  // Id del producto relacionado
    private Long facturaId;  // Id de la factura relacionada
    private Integer cantidad;
    private Integer iva;
    private Double precioUnitario;
    private Double subtotal;

    // Método para convertir de Detalle a DetalleDTO
    public static DetalleDTO fromDetalle(IDP_H1.FactuStock.Entities.Detalle detalle) {
        DetalleDTO dto = new DetalleDTO();
        dto.setId(detalle.getId());
        dto.setVentaId(detalle.getVenta() != null ? detalle.getVenta().getId() : null);  // Si venta es null, setea null
        dto.setProductoId(detalle.getProducto() != null ? detalle.getProducto().getId() : null);  // Lo mismo para producto
        dto.setFacturaId(detalle.getFactura() != null ? detalle.getFactura().getId() : null);  // Y lo mismo para factura
        dto.setCantidad(detalle.getCantidad());
        dto.setIva(detalle.getIva());
        dto.setPrecioUnitario(detalle.getPrecioUnitario());
        dto.setSubtotal(detalle.getSubtotal());
        return dto;
    }
}
