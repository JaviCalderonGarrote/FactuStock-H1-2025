package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Venta;
import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Repositories.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    public List<Venta> obtenerTodas() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> obtenerPorId(Long id) {
        return ventaRepository.findById(id);
    }

    @Transactional
    public Venta guardar(Venta venta) {
        for (Detalle detalle : venta.getDetalles()) {
            detalle.setVenta(venta);
        }
        return ventaRepository.save(venta);
    }

    public void eliminar(Long id) {
        ventaRepository.deleteById(id);
    }

    public List<Map<String, Object>> obtenerVentasPorMes(Long organizacionId, int year) {
        return ventaRepository.obtenerVentasPorMes(organizacionId, year);
    }
}
