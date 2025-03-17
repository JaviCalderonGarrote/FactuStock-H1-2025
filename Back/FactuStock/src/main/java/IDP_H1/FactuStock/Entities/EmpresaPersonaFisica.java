package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class EmpresaPersonaFisica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String nifCif;

    private String telefono;
    private String direccion;
    private String web;

    @Column(nullable = false)
    private String mail;

    @Enumerated(EnumType.STRING)
    private TipoEmpresa tipo;
    @ManyToOne
    private Organizacion organizacion;
}

enum TipoEmpresa {
    CLIENTE, PROVEEDOR, AMBOS
}

