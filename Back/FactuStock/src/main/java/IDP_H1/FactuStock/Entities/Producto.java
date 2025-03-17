package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Double precio;

    @ManyToOne
    private CategoriaProducto categoria;

    @Column(nullable = false)
    private Integer cantidadStock;

    @Column(precision = 5, scale = 2)
    private BigDecimal iva;

    @PrePersist
    public void prePersist() {
        if (iva == null) {
            iva = BigDecimal.valueOf(21.00); // Default IVA value is 21% if not provided
        }
    }

    @ManyToOne
    private Organizacion organizacion;
}
