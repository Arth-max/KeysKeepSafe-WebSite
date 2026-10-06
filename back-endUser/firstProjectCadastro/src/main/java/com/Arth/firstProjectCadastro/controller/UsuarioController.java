package com.Arth.firstProjectCadastro.controller;

import com.Arth.firstProjectCadastro.business.TokenService;
import com.Arth.firstProjectCadastro.business.UsuarioService;
import com.Arth.firstProjectCadastro.infrastructure.DTOs.*;
import com.Arth.firstProjectCadastro.infrastructure.entitys.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final TokenService tokenService;

    @PostMapping
    public ResponseEntity<Void> salvarUsuario(@RequestBody User usuario) {
        if (usuario == null) {
            return ResponseEntity.noContent().build();
        } else {
            usuarioService.salvarUsuario(usuario);
            return ResponseEntity.ok().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponseDTO> login(@RequestBody LoginDTO login) {
        try {
            User usuario = usuarioService.login(login.nome(), login.senha());
            String token = tokenService.gToken(usuario);
            return ResponseEntity.ok(new UsuarioResponseDTO(usuario, token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/image")
    public ResponseEntity<Void> salvarImagem(@RequestParam String imagemUrl, Authentication authentication) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.salvarImagem(imagemUrl, usuario.getEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/buscar-senhas")
    public ResponseEntity<List<SenhasResponseDTO>> searchSenhas(Authentication authentication) {
        User usuario = (User) authentication.getPrincipal();
        return ResponseEntity.ok(usuarioService.searchSenhas(usuario.getEmail()));
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Void> recuperarSenhaEmail(@RequestParam String email) {
        usuarioService.recuperarSenhaEmail(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirmar-senha")
    public ResponseEntity<Void> confirmSenha(Authentication authentication, @RequestBody NewSenhaDTO Csenha) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.confirmSenha(usuario.getEmail(), Csenha.senha());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/atualizarSenha")
    public ResponseEntity<Void> atualizarSenha(@RequestParam String email, @RequestParam int cod, @RequestBody NewSenhaDTO novaSenha) {
        usuarioService.atualizarSenha(email, cod, novaSenha.senha());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/gerar-senha")
    public ResponseEntity<String> gerarSenha(@RequestBody GerarSenhaDTO senhaGerada) {
        String senha = usuarioService.gerarSenha(senhaGerada.tamanho(), senhaGerada.numeros(), senhaGerada.maiusculas(),
                senhaGerada.minusculas(), senhaGerada.especiais());
        return ResponseEntity.ok(senha);
    }

    @PostMapping("/salvar-senha")
    public ResponseEntity<Void> salvarSenha(Authentication authentication, @RequestBody SalvarSenhaDTO Ssenha) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.salvarSenha(usuario.getEmail(), Ssenha.senha(), Ssenha.descricao());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deletarUsuarioPorEmail(Authentication authentication) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.deletarUsuarioPorEmail(usuario.getEmail());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/image")
    public ResponseEntity<Void> deletarImagem(Authentication authentication) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.deletarImagem(usuario.getNome());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/deletar-senha")
    public ResponseEntity<Void> deletarSenha(Authentication authentication, @RequestParam int id) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.deletarSenha(usuario.getEmail(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<Void> atualizarUsuario(Authentication authentication, @RequestBody User usuario) {
        User usuarioLogado = (User) authentication.getPrincipal();
        usuarioService.atualizarUsuario(usuarioLogado.getEmail(), usuario);
        return ResponseEntity.ok().build();
    }
}
