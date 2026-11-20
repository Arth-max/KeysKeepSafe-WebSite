package com.Arth.firstProjectCadastro.business;

import com.Arth.firstProjectCadastro.infrastructure.DTOs.SenhasResponseDTO;
import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import com.Arth.firstProjectCadastro.infrastructure.entitys.SenhasSalvas;
import com.Arth.firstProjectCadastro.infrastructure.repositorys.LogsRepository;
import com.Arth.firstProjectCadastro.infrastructure.repositorys.SenhasRepository;
import com.Arth.firstProjectCadastro.infrastructure.repositorys.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final EmailService EmailService;
    private final SenhasService SenhasService;
    private final LogService logService;
    private final SenhasRepository senhasRepository;
    private final LogsRepository logsRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();
    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);
    private final LoginAttemptService loginAttempt = new LoginAttemptService();

    public UsuarioService(UsuarioRepository repository, EmailService EmailService,
                          SenhasRepository senhasRepository, LogsRepository logsRepository, SenhasService SenhasService,
                          LogService logService) {
        this.EmailService = EmailService;
        this.repository = repository;
        this.senhasRepository = senhasRepository;
        this.logsRepository = logsRepository;
        this.SenhasService = SenhasService;
        this.logService = logService;
    }

    public void salvarUsuario(User usuario) {
        log.info("Cadastro realizado");
        String senhaHash = encoder.encode(usuario.getSenha());
        usuario.setSenha(senhaHash);
        repository.saveAndFlush(usuario);
    }

    public User login(String email, String senha) {
        log.debug("Tentativa de login");
        String id = email.trim().toLowerCase();

        if (loginAttempt.bloqueado(id)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Muitas tentativas. Tente novamente em alguns minutos");
        }

        User usuario = repository.findByEmail(email).orElseThrow(() -> {
            log.warn("Falha no login: Usuário não encontrado");
            return new RuntimeException("Email não encontrado");
        });

        if (!encoder.matches(senha, usuario.getSenha())) {
            log.warn("Falha no login: Senha incorreta (usuarioId={})", usuario.getId());
            loginAttempt.failed(id);
            logService.register(usuario, "LOGIN_BAD", "Tentativa de login mal-sucedida");
            throw new RuntimeException("Senha incorreta");
        } else {
            log.info("Login realizado (usuarioId={})", usuario.getId());
            loginAttempt.succed(id);
            logService.register(usuario, "LOGIN", "Login bem-sucedido");
            return usuario;
        }
    }

    public void salvarImagem(String image, String email) {
        log.debug("Salvando imagem");
        User usuario = repository.findByEmail(email).orElseThrow(() -> {
            log.warn("Falha na tentativa de salvar imagem: usuário não encontrado");
            return new RuntimeException("Usuário não encontrado");
        });

        usuario.setUrlImg(image);
        repository.saveAndFlush(usuario);
        log.info("Imagem salva (usuarioId={})", usuario.getId());
        logService.register(usuario, "IMAGEM_ADICIONADA",
                "Uma imagem foi adicionado ao fundo do site de sua conta");
    }

    public void deletarImagem(String email) {
        User usuario = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado")
        );
        usuario.setUrlImg(null);
        repository.saveAndFlush(usuario);
        log.info("Imagem deletada (usuarioId={})", usuario.getId());
        logService.register(usuario, "IMAGEM_DELETADA",
                "Uma imagem de fundo da sua conta foi deletada");
    }

    public void recuperarSenhaEmail(String email) {
        log.debug("Enviando email");
        User usuario = repository.findByEmail(email).orElseThrow(() -> {
            log.warn("Falha ao enviar email: Usuário não encontrado");
            return new RuntimeException("email não encontrado");
        });

        int codigo = 100000 + random.nextInt(900000);
        String cod = String.valueOf(codigo);
        usuario.setCodigoRecuperacao(cod);
        usuario.setCodExpiracao(LocalDateTime.now().plusMinutes(10));
        repository.saveAndFlush(usuario);
        EmailService.enviarEmail(email, "Recuperação de senha", "Seu código é: " + usuario.getCodigoRecuperacao() + "\nDigite este código no site para continuar operação");
        log.info("Email enviado (usuarioId={})", usuario.getId());
    }

    public void atualizarSenha(String email, int cod, String novaSenha) {
        log.debug("Atualizando senha");
        User usuarioEntity = repository.findByEmail(email).orElseThrow(() -> {
            log.warn("Erro ao atualizar senha: Usuário não encontrado");
            return new RuntimeException("Usuario não encontrado");
        });

        if (usuarioEntity.getCodigoRecuperacao() == null || usuarioEntity.getCodExpiracao() == null) {
            log.warn("Erro ao atualizar a senha: Código inexistente");
            throw new RuntimeException("Código inexistente, por favor digite o código");
        }
        if (!LocalDateTime.now().isBefore(usuarioEntity.getCodExpiracao())) {
            usuarioEntity.setCodigoRecuperacao(null);
            usuarioEntity.setCodExpiracao(null);
            repository.saveAndFlush(usuarioEntity);

            log.warn("Código expirado (usuarioId={})", usuarioEntity.getId());
            throw new RuntimeException("Código expirado");
        }
        if (!usuarioEntity.getCodigoRecuperacao().equals(cod)) {
            log.warn("Código inválido (usuarioId={})", usuarioEntity.getId());
            throw new RuntimeException("Código inválido");
        }
        if (novaSenha == null || novaSenha.isBlank()) {
            log.warn("Erro ao atualizar senha: campo vazio");
            throw new RuntimeException("A senha não pode ser vazia");
        }
            usuarioEntity.setSenha(encoder.encode(novaSenha));
            usuarioEntity.setCodigoRecuperacao(null);
            usuarioEntity.setCodExpiracao(null);
            repository.saveAndFlush(usuarioEntity);
            log.info("Senha atualizada (usuarioId={})", usuarioEntity.getId());
            logService.register(usuarioEntity, "SENHA_ATUALIZADA", "Sua senha do site foi atualizada");
    }

    public void confirmSenha(String email, String senha) {
        User usuario = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuario não encontrado")
        );
        if (!encoder.matches(senha, usuario.getSenha())) {
            throw new RuntimeException("Senha incorreta");
        }
    }

    public String gerarSenha(int tamanho, Boolean numeros, Boolean Maiusculas, Boolean Minusculas, Boolean Especiais) {
        StringBuilder pool = new StringBuilder();
        StringBuilder senhaCriada = new StringBuilder();

        if (tamanho < 8 || tamanho > 20) {
            throw new RuntimeException("Senha muito grande ou muito pequena");
        }

        String numerosCharacters = "0123456789";
        String maiusculasCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String minusculasCharacters = "abcdefghijklmnopqrstuvwxyz";
        String especiaisCharacters = "!@#$%&*()<>{}/-";
        int obrigatorios = 0;

        if (Boolean.TRUE.equals(numeros)) {
            pool.append(numerosCharacters);
            senhaCriada.append(numerosCharacters.charAt(random.nextInt(numerosCharacters.length())));
            obrigatorios++;
        }
        if (Boolean.TRUE.equals(Maiusculas)) {
            pool.append(maiusculasCharacters);
            senhaCriada.append(maiusculasCharacters.charAt(random.nextInt(maiusculasCharacters.length())));
            obrigatorios++;
        }
        if (Boolean.TRUE.equals(Minusculas)) {
            pool.append(minusculasCharacters);
            senhaCriada.append(minusculasCharacters.charAt(random.nextInt(minusculasCharacters.length())));
            obrigatorios++;
        }
        if (Boolean.TRUE.equals(Especiais)) {
            pool.append(especiaisCharacters);
            senhaCriada.append(especiaisCharacters.charAt(random.nextInt(especiaisCharacters.length())));
            obrigatorios++;
        }

        if (pool.isEmpty()) throw new RuntimeException("Selecione um tipo de caracterer");

        for (int i = obrigatorios; i < tamanho; i++) {
            senhaCriada.append(pool.charAt(random.nextInt(pool.length())));
        }
        List<Character> Caracteres = new ArrayList<>();
        for (int j = 0; j < senhaCriada.length(); j++) {
            Caracteres.add(senhaCriada.charAt(j));
        }
        Collections.shuffle(Caracteres, random);
        StringBuilder result = new StringBuilder();

        for (char c: Caracteres) {
            result.append(c);
        }

        return result.toString();
    }

    public void salvarSenha(String email, String Ssenha, String descricao) {
        log.debug("Salvando senha");
        User usuarioEntity = repository.findByEmail(email).orElseThrow(() -> {
            log.warn("Erro ao salvar senha: Usuário não encontrado");
            return new RuntimeException("Usuario não encontrado");
        });

        if (descricao == null || descricao.isBlank()) {
            log.warn("Falta de descrição");
            throw new RuntimeException("Coloque uma descricao para salvar a senha");
        }

        if (Ssenha == null || Ssenha.isBlank()) {
            log.warn("Sem senha");
            throw new RuntimeException("Se quiser salvar uma senha, coloque uma senha");
        }

        try {
            String senhaCripto = SenhasService.encrypt(Ssenha);
            SenhasSalvas salvarSenha = SenhasSalvas.builder()
                    .descricao(descricao).senhaCrypto(senhaCripto)
                    .dataCriacao(LocalDateTime.now()).usuario(usuarioEntity)
                    .build();

            senhasRepository.save(salvarSenha);
            log.info("Senha salva (usuarioId={})", usuarioEntity.getId());
            logService.register(usuarioEntity,
                    "SENHA_SALVA", "Nova senha adicionada na conta");
        } catch (Exception e) {
            log.error("Erro ao criptografar senha (usuarioId={})", usuarioEntity.getId(), e);
            throw new RuntimeException("Erro ao criptografar a senha");
        }
    }

    public List<SenhasResponseDTO> searchSenhas(String email) {
        User usuario = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado")
        );

        return senhasRepository.findByUsuario(usuario).stream()
                .map(s -> {
                    try {
                        return new SenhasResponseDTO(
                                s.getId(), s.getDataCriacao(),
                                s.getDescricao(), SenhasService.decrypt(s.getSenhaCrypto())
                        );
                    } catch (Exception e) {
                        log.error("Error ao descriptografar senhas (usuarioId={})", usuario.getId());
                        throw new RuntimeException("Erro ao descriptografar senhas");
                    }
                }).toList();
    }

    public void atualizarUsuario(String email, User usuario) {
        log.debug("Atualizando usuário");
        User usuarioEntity = repository.findByEmail(email).orElseThrow(() -> {
            log.warn("Erro ao atualizar usuário: Usuário não encontrado");
            return new RuntimeException("Usuario não encontrado");
        });

        if (usuario.getNome() != null) { usuarioEntity.setNome(usuario.getNome()); }
        if (usuario.getEmail() != null) { usuarioEntity.setEmail(usuario.getEmail()); }
        if (usuario.getSenha() != null && !usuario.getSenha().isBlank()) { usuarioEntity.setSenha(encoder.encode(usuario.getSenha())); }
        repository.saveAndFlush(usuarioEntity);
        log.info("Usuário atualizado (usuarioId={})", usuarioEntity.getId());
        logService.register(usuarioEntity,
                "ATUALIZACAO_DE_CONTA", "Alterações feitas nas informações de sua conta");
    }

    public void deletarUsuarioPorEmail(String email) {
        User usuario = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado")
        );
        log.info("Usuário deletado");
        senhasRepository.deleteByUsuario(usuario);
        logsRepository.deleteByUsuario(usuario);
        repository.delete(usuario);
    }

    public void deletarSenha(String email, int id) {
        User usuarioEntity = repository.findByEmail(email).orElseThrow(() -> {
            log.warn("Erro ao deletar senha: Usuário não encontrado");
            return new RuntimeException("Usuario não encontrado");
        });

        SenhasService.deletarSenha(email, id);
        log.info("Senha deletada (usuarioId={}", usuarioEntity.getId());
        logService.register(usuarioEntity, "SENHA_DELETADA", "Uma senha foi deletada de sua conta");
    }

    public User buscarPorEmail(String email) {
        return repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado")
        );
    }
}