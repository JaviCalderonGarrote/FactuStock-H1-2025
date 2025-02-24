package IDP_H1.FactuStock.Entities;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Organizacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;

    private String direccion;
    private String telefono;

    @Column(nullable = false, unique = true)
    private String nifCif;

    private String web;
    
    @Lob
    private byte[] logo;


}
