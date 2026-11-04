package com.Arth.firstProjectCadastro.business;

import com.Arth.firstProjectCadastro.infrastructure.entitys.Log;
import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import com.Arth.firstProjectCadastro.infrastructure.repositorys.LogsRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LogService {
    private final LogsRepository logsRepository;

    public LogService(LogsRepository logsRepository) {
        this.logsRepository = logsRepository;
    }

    public void register(User user, String acao, String descricao) {
        Log log = new Log();
        log.setUsuario(user);
        log.setAcao(acao);
        log.setDescricao(descricao);
        log.setHorario(LocalDateTime.now());

        logsRepository.save(log);
    }

    public List<Log> buscarLogs(Integer usuarioId) {
        return logsRepository.findByUsuarioIdOrderByHorarioDesc(usuarioId);
    }
}
