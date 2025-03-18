package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.EmpresaOPersonaFisicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmpresaPersonaFisicaService {

    @Autowired
    private EmpresaOPersonaFisicaRepository repository;

    // Obtener todas las empresas o personas físicas
    public List<EmpresaPersonaFisica> obtenerTodos() {
        return repository.findAll();
    }

    // Obtener empresas/personas físicas por organización
    public List<EmpresaPersonaFisica> obtenerPorOrganizacion(Organizacion organizacion) {
        return repository.findByOrganizacion(organizacion);
    }

    // Obtener empresas/personas físicas por ID
    public Optional<EmpresaPersonaFisica> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    // Guardar (crear o actualizar) empresa/persona física
    public EmpresaPersonaFisica guardar(EmpresaPersonaFisica cliente) {
        return repository.save(cliente);
    }

    // Eliminar empresa/persona física por ID
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    // Obtener empresas/personas físicas por idOrganizacion
    public List<EmpresaPersonaFisica> findByOrganizacion(Long idOrganizacion) {
        return repository.findByOrganizacionId(idOrganizacion);
    }
}
