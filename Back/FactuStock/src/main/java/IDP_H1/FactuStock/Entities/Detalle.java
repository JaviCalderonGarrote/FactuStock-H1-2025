package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Detalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)  // Cargamos la relación inmediatamente
    private Venta venta;

    @ManyToOne(fetch = FetchType.EAGER)  // Cargamos la relación inmediatamente
    private Producto producto;

    @ManyToOne(fetch = FetchType.EAGER)  // Cargamos la relación inmediatamente
    @JoinColumn(name = "factura_id") // Relación con factura
    private Factura factura;  // Relación con la factura

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Integer iva;

    @Column(nullable = false)
    private Double precioUnitario;

    @Column(nullable = false)
    private Double subtotal;
}
