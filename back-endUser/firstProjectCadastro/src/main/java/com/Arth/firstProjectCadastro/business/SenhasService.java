package com.Arth.firstProjectCadastro.business;

import com.Arth.firstProjectCadastro.infrastructure.entitys.SenhasSalvas;
import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import com.Arth.firstProjectCadastro.infrastructure.repositorys.SenhasRepository;
import com.Arth.firstProjectCadastro.infrastructure.repositorys.UsuarioRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import java.security.SecureRandom;

@Service
public class SenhasService {
    private static final String Transform = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;
    private final SecureRandom random = new SecureRandom();
    private final UsuarioRepository repository;
    private final SenhasRepository senhasRepository;
    private final SecretKey secretKey;

    public SenhasService(UsuarioRepository repository, SenhasRepository senhasRepository, @Value("${app.fixed_Key}") String key) {
        this.repository = repository;
        this.senhasRepository = senhasRepository;

        byte[] keyBytes = Base64.getDecoder().decode(key);
        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("A chave deve possuir 32 bytes");
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
