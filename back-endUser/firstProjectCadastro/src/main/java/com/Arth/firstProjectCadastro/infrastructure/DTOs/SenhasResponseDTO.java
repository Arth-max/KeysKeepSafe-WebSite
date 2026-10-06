package com.Arth.firstProjectCadastro.infrastructure.DTOs;

import java.time.LocalDateTime;

public record SenhasResponseDTO(Integer id, LocalDateTime dataCreate, String descricao, String senha) {
}
