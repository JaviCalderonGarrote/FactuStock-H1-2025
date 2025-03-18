package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Data
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroFactura;

    @ManyToOne
    private Organizacion organizacion;

    @ManyToOne
    private EmpresaPersonaFisica EmpresaPersonaFisica;

    @ManyToOne
    private Usuario usuario;

    @Column(nullable = false)
    private Double total = 0.0;


    @Lob
    private byte[] archivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoFactura estado;

    @Column(nullable = false)
    private LocalDateTime fecha;


    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date fechaCreacionFactura;

    @Enumerated(EnumType.STRING)
    private FormaPago formaPago;
}

enum EstadoFactura {
    ENVIADA, RECIBIDA, ERROR, PAGADA, COMPLETADA
}

enum FormaPago {
    NoCobrada,EFECTIVO, TARJETA, TRANSFERENCIA
}
