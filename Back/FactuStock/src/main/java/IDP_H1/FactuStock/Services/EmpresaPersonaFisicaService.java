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

    public List<EmpresaPersonaFisica> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<EmpresaPersonaFisica> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public EmpresaPersonaFisica guardar(EmpresaPersonaFisica empresa) {
        return repository.save(empresa);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
