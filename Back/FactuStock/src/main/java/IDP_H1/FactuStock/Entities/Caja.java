package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Caja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    @Column(columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private Double totalIngresado;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer cantidadVentas;

    @Enumerated(EnumType.STRING)
    private EstadoCaja estado = EstadoCaja.ABIERTA;
}

enum EstadoCaja {
    ABIERTA, CERRADA
}
