package com.Arth.firstProjectCadastro.infrastructure.repositorys;

import com.Arth.firstProjectCadastro.infrastructure.entitys.Log;
import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogsRepository extends JpaRepository<Log, Long> {
    List<Log> findByUsuarioIdOrderByHorarioDesc(Integer usuarioId);

    @Transactional
    void deleteByUsuario(User usuario);
}
