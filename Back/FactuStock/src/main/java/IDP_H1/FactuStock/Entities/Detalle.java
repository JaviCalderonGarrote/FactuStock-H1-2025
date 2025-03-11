package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Detalle{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Venta venta;

    @ManyToOne
    private Producto producto;

    @ManyToOne
    private Factura Factura;


    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Integer iva;

    @Column(nullable = false)
    private Double precioUnitario;

    @Column(nullable = false)
    private Double subtotal;
}
