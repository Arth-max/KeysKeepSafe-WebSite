package com.Arth.firstProjectCadastro.infrastructure.DTOs;


import com.Arth.firstProjectCadastro.infrastructure.entitys.User;

public record UsuarioResponseDTO(String nome, String email, String urlImg, String token) {
    public UsuarioResponseDTO(User usuario, String token) {
        this(usuario.getNome(), usuario.getEmail(), usuario.getUrlImg(), token);
    }
}
