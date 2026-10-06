package com.Arth.firstProjectCadastro.infrastructure.DTOs;

public record GerarSenhaDTO(int tamanho, Boolean numeros, Boolean maiusculas,
                            Boolean minusculas, Boolean especiais) {
}
