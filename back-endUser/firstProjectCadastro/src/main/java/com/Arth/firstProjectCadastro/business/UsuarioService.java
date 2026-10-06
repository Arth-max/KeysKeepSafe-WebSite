package com.Arth.firstProjectCadastro.business;

import com.Arth.firstProjectCadastro.infrastructure.DTOs.SenhasResponseDTO;
import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import com.Arth.firstProjectCadastro.infrastructure.entitys.SenhasSalvas;
import com.Arth.firstProjectCadastro.infrastructure.repository.SenhasRepository;
import com.Arth.firstProjectCadastro.infrastructure.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Collections;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final EmailService EmailService;
    private final SenhasRepository senhasRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    private static final String Transform = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;
    private final SecretKey secretKey;

    public UsuarioService(UsuarioRepository repository, EmailService EmailService,
                          SenhasRepository senhasRepository, @Value("${app.fixed_Key}") String key) {
        this.EmailService = EmailService;
        this.repository = repository;
        this.senhasRepository = senhasRepository;

        byte[] keyBytes = Base64.getDecoder().decode(key);
        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("A chave deve possuir 32 bits");
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String encryptText) throws Exception {
        byte[] iv = new byte[IV_LENGTH_BYTE];
        random.nextBytes(iv);

        Cipher cipher = Cipher.getInstance(Transform);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);

        cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
        byte[] cipherText = cipher.doFinal(encryptText.getBytes(StandardCharsets.UTF_8));

        ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
        byteBuffer.put(iv);
        byteBuffer.put(cipherText);

        return Base64.getEncoder().encodeToString(byteBuffer.array());
    }

    public String decrypt(String strToDecrypt) throws Exception {
        byte[] decodedBytes = Base64.getDecoder().decode(strToDecrypt);

        if (decodedBytes.length <= IV_LENGTH_BYTE) {
            throw new IllegalArgumentException("Criptografia inválida");
        }

        ByteBuffer byteBuffer = ByteBuffer.wrap(decodedBytes);
        byte[] iv = new byte[IV_LENGTH_BYTE];
        byteBuffer.get(iv);

        byte[] cipherText = new byte[byteBuffer.remaining()];
        byteBuffer.get(cipherText);

        Cipher cipher = Cipher.getInstance(Transform);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);

        cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);
        byte[] pText = cipher.doFinal(cipherText);

        return new String(pText, StandardCharsets.UTF_8);
    }

    public void salvarUsuario(User usuario) {
        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            throw new RuntimeException("Senha inválida");
        }
        String senhaHash = encoder.encode(usuario.getSenha());
        usuario.setSenha(senhaHash);
        repository.saveAndFlush(usuario);
    }

    public User login(String nome, String senha) {
        User usuario = repository.findByNome(nome).orElseThrow(
                () -> new RuntimeException("Usuario não encontrado"));

        if (!encoder.matches(senha, usuario.getSenha())) {
            throw new RuntimeException("Senha incorreta");
        }
        return usuario;
    }

    public void salvarImagem(String image, String nome) {
        User usuario = repository.findByNome(nome).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado")
        );
        usuario.setUrlImg(image);
        repository.saveAndFlush(usuario);
    }

    public void deletarImagem(String nome) {
        User usuario = repository.findByNome(nome).orElseThrow(
                () -> new RuntimeException("Usuário não encontrado")
        );
        usuario.setUrlImg(null);
        repository.saveAndFlush(usuario);
    }

    public void recuperarSenhaEmail(String email) {
        User usuario = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("email não encontrado")
        );
        int cod = 100000 + random.nextInt(900000);
        usuario.setCodigoRecuperacao(cod);
        usuario.setCodExpiracao(LocalDateTime.now().plusMinutes(10));
        repository.saveAndFlush(usuario);
        EmailService.enviarEmail(email, "Recuperação de senha", "Seu código é: " + usuario.getCodigoRecuperacao() + "\nDigite este código no site para continuar operação");
    }

    public void atualizarSenha(String email, int cod, String novaSenha) {
        User usuarioEntity = repository.findByEmail(email).orElseThrow(
                    () -> new RuntimeException("Usuario não encontrado")
        );
        if (usuarioEntity.getCodigoRecuperacao() == null || usuarioEntity.getCodExpiracao() == null) {
            throw new RuntimeException("Código inexistente, por favor digite o código");
        }
        if (!LocalDateTime.now().isBefore(usuarioEntity.getCodExpiracao())) {
            usuarioEntity.setCodigoRecuperacao(null);
            usuarioEntity.setCodExpiracao(null);
            repository.saveAndFlush(usuarioEntity);

            throw new RuntimeException("Código expirado");
        }
        if (!usuarioEntity.getCodigoRecuperacao().equals(cod)) {
            throw new RuntimeException("Código inválido");
        }
        if (novaSenha == null || novaSenha.isBlank()) {
            throw new RuntimeException("A senha não pode ser vazia");
        }
            usuarioEntity.setSenha(encoder.encode(novaSenha));
            usuarioEntity.setCodigoRecuperacao(null);
            usuarioEntity.setCodExpiracao(null);
            repository.saveAndFlush(usuarioEntity);
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
        User usuarioEntity = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuario não encontrado")
        );

        if (descricao == null || descricao.isBlank()) {
            throw new RuntimeException("Coloque uma descricao para salvar a senha");
        }

        if (Ssenha == null || Ssenha.isBlank()) {
            throw new RuntimeException("Se quiser salvar uma senha, coloque uma senha");
        }

        try {
            String senhaCripto = encrypt(Ssenha);
            SenhasSalvas salvarSenha = SenhasSalvas.builder()
                    .Descricao(descricao).SenhaCrypto(senhaCripto)
                    .dataCriacao(LocalDateTime.now()).usuario(usuarioEntity)
                    .build();

            senhasRepository.save(salvarSenha);
        } catch (Exception e) {
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
                                    s.getDescricao(), decrypt(s.getSenhaCrypto())
                            );
                        } catch (Exception e) {
                            throw new RuntimeException("Erro ao descriptografar senhas");
                        }
                }).toList();
    }

    public void atualizarUsuario(String email, User usuario) {
        User usuarioEntity = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuario não encontrado")
        );
        if (usuario.getNome() != null) { usuarioEntity.setNome(usuario.getNome()); }
        if (usuario.getEmail() != null) { usuarioEntity.setEmail(usuario.getEmail()); }
        if (usuario.getSenha() != null && !usuario.getSenha().isBlank()) { usuarioEntity.setSenha(encoder.encode(usuario.getSenha())); }
        repository.saveAndFlush(usuarioEntity);
    }

    public void deletarUsuarioPorEmail(String email) {
        repository.deleteByEmail(email);
    }

    public void deletarSenha(String email, int id) {
        User usuario = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Usuario não encontrado")
        );
        SenhasSalvas senhaD = senhasRepository.findByIdAndUsuario(id, usuario).orElseThrow(
                () -> new RuntimeException("Password not found")
        );
        senhasRepository.delete(senhaD);
    }
}