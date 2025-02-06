package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroFactura;

    @ManyToOne
    private Organizacion empresa;

    @ManyToOne
    private Usuario usuario;

    @Column(nullable = false)
    private Double total;

    @Lob
    private byte[] archivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoFactura estado;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    private FormaPago formaPago;
}

enum EstadoFactura {
    ENVIADA, RECIBIDA, ERROR, PAGADA, COMPLETADA
}

enum FormaPago {
    EFECTIVO, TARJETA, TRANSFERENCIA
}
