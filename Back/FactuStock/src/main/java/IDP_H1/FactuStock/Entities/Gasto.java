package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Gasto{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double monto;

    private String numFactura;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoGasto estado;

    @Lob
    private byte[] archivoFactura;

    @ManyToOne
    private Organizacion empresa;

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private CategoriaGasto categoriaGasto;
}

enum EstadoGasto {
    RECIBIDO, PAGADO, COMPLETO
}
