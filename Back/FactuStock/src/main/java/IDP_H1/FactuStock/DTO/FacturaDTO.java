package IDP_H1.FactuStock.DTO;

import IDP_H1.FactuStock.Entities.EstadoFactura;
import IDP_H1.FactuStock.Entities.FormaPago;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacturaDTO {
    private Long id;
    private String numeroFactura;
    private Double total;
    private EstadoFactura estado;
    private LocalDateTime fecha;
    private LocalDateTime fechaCreacionFactura;
    private FormaPago formaPago;
    private List<DetalleDTO> detalles;  // Lista de detalles en el DTO

    // Método estático para convertir una entidad Factura a un DTO
    public static FacturaDTO fromFactura(IDP_H1.FactuStock.Entities.Factura factura) {
        FacturaDTO dto = new FacturaDTO();
        dto.setId(factura.getId());
        dto.setNumeroFactura(factura.getNumeroFactura());
        dto.setTotal(factura.getTotal());
        dto.setEstado(factura.getEstado());
        dto.setFecha(factura.getFecha());
        dto.setFechaCreacionFactura(factura.getFechaCreacionFactura());
        dto.setFormaPago(factura.getFormaPago());

        // Convierte los detalles de la factura a DTO
        List<DetalleDTO> detallesDTO = factura.getDetalles().stream()
                .map(DetalleDTO::fromDetalle)
                .collect(Collectors.toList());
        dto.setDetalles(detallesDTO);

        return dto;
    }
}
