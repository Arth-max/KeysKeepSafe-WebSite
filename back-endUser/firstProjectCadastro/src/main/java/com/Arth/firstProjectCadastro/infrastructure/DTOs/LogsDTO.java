package com.Arth.firstProjectCadastro.infrastructure.DTOs;

import com.Arth.firstProjectCadastro.infrastructure.entitys.Log;

import java.time.LocalDateTime;

public record LogsDTO(Long id, String acao, String descricao, LocalDateTime horario) {
    public LogsDTO(Log L) {
        this(L.getId(), L.getAcao(), L.getDescricao(), L.getHorario());
    }
}