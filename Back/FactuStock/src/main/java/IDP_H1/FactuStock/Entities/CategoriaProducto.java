package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class CategoriaProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;
}
