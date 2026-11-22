package com.Arth.firstProjectCadastro.controller;

import com.Arth.firstProjectCadastro.business.ImageService;
import com.Arth.firstProjectCadastro.business.TokenService;
import com.Arth.firstProjectCadastro.business.UsuarioService;
import com.Arth.firstProjectCadastro.infrastructure.DTOs.*;
import com.Arth.firstProjectCadastro.infrastructure.entitys.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioService usuarioService;
    private final TokenService tokenService;
    private final ImageService imageService;

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
        User usuario = usuarioService.login(login.email(), login.senha());
        String token = tokenService.gToken(usuario);
        return ResponseEntity.ok(new UsuarioResponseDTO(usuario, token));
    }

    @GetMapping
    public ResponseEntity<UsuarioResponseDTO> buscarUser(Authentication authentication) {
        User usuario = (User) authentication.getPrincipal();
        return ResponseEntity.ok(new UsuarioResponseDTO(usuario, null));
    }

    @PostMapping(value = "/imagem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> salvarImagem(@AuthenticationPrincipal User usuario,
                                             @RequestParam("file") MultipartFile file) throws IOException {
        usuarioService.salvarImagem(usuario.getEmail(), file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/imagem")
    public ResponseEntity<Resource> VerImagem(@AuthenticationPrincipal User usuario) {
        String nome = usuario.getUrlImg();
        Resource r = imageService.carregar(nome);
        MediaType tipo = nome.endsWith(".png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok().contentType(tipo)
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.VARY, "Authorization")
                .body(r);
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Void> recuperarSenhaEmail(@RequestParam String email) {
        usuarioService.recuperarSenhaEmail(email);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/atualizarSenha")
    public ResponseEntity<Void> atualizarSenha(@RequestParam String email, @RequestParam int cod, @RequestBody NewSenhaDTO novaSenha) {
        usuarioService.atualizarSenha(email, cod, novaSenha.senha());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirmar-senha")
    public ResponseEntity<Void> confirmSenha(Authentication authentication, @RequestBody NewSenhaDTO Csenha) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.confirmSenha(usuario.getEmail(), Csenha.senha());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/gerar-senha")
    public ResponseEntity<String> gerarSenha(@RequestBody GerarSenhaDTO senhaGerada) {
        String senha = usuarioService.gerarSenha(senhaGerada.tamanho(), senhaGerada.numeros(), senhaGerada.maiusculas(),
                senhaGerada.minusculas(), senhaGerada.especiais());
        return ResponseEntity.ok(senha);
    }

    @GetMapping("/buscar-senhas")
    public ResponseEntity<List<SenhasResponseDTO>> searchSenhas(Authentication authentication) {
        User usuario = (User) authentication.getPrincipal();
        return ResponseEntity.ok(usuarioService.searchSenhas(usuario.getEmail()));
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
        imageService.apagar(usuario.getUrlImg());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/image")
    public ResponseEntity<Void> deletarImagem(Authentication authentication) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.deletarImagem(usuario.getEmail());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/deletar-senha")
    public ResponseEntity<Void> deletarSenha(Authentication authentication, @RequestParam int id) {
        User usuario = (User) authentication.getPrincipal();
        usuarioService.deletarSenha(usuario.getEmail(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<UsuarioResponseDTO> atualizarUsuario(Authentication authentication, @RequestBody User usuario) {
        User usuarioLogado = (User) authentication.getPrincipal();
        usuarioService.atualizarUsuario(usuarioLogado.getEmail(), usuario);

        User usuarioAtualizado = usuarioService.buscarPorEmail(usuario.getEmail() != null ? usuario.getEmail() : usuarioLogado.getEmail());
        String newToken = tokenService.gToken(usuarioAtualizado);
        return ResponseEntity.ok(new UsuarioResponseDTO(usuarioAtualizado, newToken));
    }
}