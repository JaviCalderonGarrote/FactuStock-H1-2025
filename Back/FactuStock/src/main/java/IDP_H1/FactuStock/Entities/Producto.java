package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

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

    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 21")
    private Double iva;
}
