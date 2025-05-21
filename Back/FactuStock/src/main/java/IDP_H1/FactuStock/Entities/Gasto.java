package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Gasto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double monto;

    private String numFactura;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoGasto estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pago_gasto", nullable = false)
    private FormaPagoGasto formaPagoGasto;

    @Lob
    private byte[] archivoFactura;

    private String nombreArchivoFactura;

    @ManyToOne
    private Organizacion organizacion;

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private CategoriaGasto categoriaGasto;

    @ManyToOne(fetch = FetchType.EAGER)
    private EmpresaPersonaFisica empresaPersonaFisica;

    @Column(nullable = false)
    private LocalDateTime fecha;
}

enum EstadoGasto {
    RECIBIDO, COMPLETADO, ERROR
}

enum FormaPagoGasto {
    EFECTIVO, TARJETA, TRANSFERENCIA, NO_PAGADA
}
