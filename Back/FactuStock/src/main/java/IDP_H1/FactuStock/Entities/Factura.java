package IDP_H1.FactuStock.Entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroFactura;

    @ManyToOne(fetch = FetchType.EAGER)
    private Organizacion organizacion;

    @ManyToOne(fetch = FetchType.EAGER)
    private EmpresaPersonaFisica empresaPersonaFisica;

    @ManyToOne(fetch = FetchType.EAGER)
    private Usuario usuario;

    @Column(nullable = false)
    private Double total = 0.0;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference  // Evita la recursividad durante la serialización de la lista de detalles
    private List<Detalle> detalles = new ArrayList<>();

    @Lob
    private byte[] archivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoFactura estado;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacionFactura;

    @Enumerated(EnumType.STRING)
    private FormaPago formaPago;

    // Método para actualizar el total de la factura según los detalles
    public void actualizarTotal() {
        double totalCalculado = 0.0;
        for (Detalle detalle : detalles) {
            totalCalculado += detalle.getSubtotal();  // Sumar el subtotal de cada detalle
        }
        this.total = totalCalculado;
    }
}
