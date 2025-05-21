package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Detalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleRepository extends JpaRepository<Detalle, Long> {
    @Query("SELECT d.nombre, SUM(d.cantidad) as totalVendido FROM Detalle d WHERE d.venta.organizacion.id = :organizacionId GROUP BY d.nombre ORDER BY totalVendido DESC")
    List<Object[]> findTop5ProductosMasVendidos(@Param("organizacionId") Long organizacionId);
}

