package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

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
    @JoinColumn(name = "organizacion_id", nullable = false)
    private Organizacion organizacion;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "categoria_gasto_id")
    private CategoriaGasto categoriaGasto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empresa_persona_fisica_id")
    private EmpresaPersonaFisica empresaPersonaFisica;
}

enum EstadoGasto {
    RECIBIDO, COMPLETADO, ERROR
}

enum FormaPagoGasto {
    EFECTIVO, TARJETA, TRANSFERENCIA, NO_PAGADA
}
