package IDP_H1.FactuStock.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private Caja caja;

    @ManyToOne(optional = true)
    @JoinColumn(name = "empresa_id", nullable = true)
    private EmpresaPersonaFisica empresa;

    @ManyToOne
    private Organizacion organizacion;

    @ManyToOne(fetch = FetchType.EAGER)
    private EmpresaPersonaFisica empresaPersonaFisica;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Detalle> detalles = new ArrayList<>();

    // Método para calcular el total de la venta
    public Double getTotal() {
        return detalles.stream()
                .mapToDouble(detalle -> detalle.getPrecioUnitario() * detalle.getCantidad())
                .sum();
    }

    // Métodos para manejar la relación bidireccional con Detalle
    public void addDetalle(Detalle detalle) {
        if (detalle != null) {
            detalles.add(detalle);
            detalle.setVenta(this);
        }
    }

    public void removeDetalle(Detalle detalle) {
        if (detalle != null) {
            detalles.remove(detalle);
            detalle.setVenta(null);
        }
    }
}
