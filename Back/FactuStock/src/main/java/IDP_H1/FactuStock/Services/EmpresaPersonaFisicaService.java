package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Repositories.EmpresaOPersonaFisicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmpresaPersonaFisicaService {

    @Autowired
    private EmpresaOPersonaFisicaRepository repository;

    // Obtener todos los clientes
    public List<EmpresaPersonaFisica> obtenerTodos() {
        return repository.findAll();
    }

    // Obtener cliente por ID
    public Optional<EmpresaPersonaFisica> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    // Guardar cliente (crear o actualizar)
    public EmpresaPersonaFisica guardar(EmpresaPersonaFisica cliente) {
        return repository.save(cliente);
    }

    // Eliminar cliente
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
