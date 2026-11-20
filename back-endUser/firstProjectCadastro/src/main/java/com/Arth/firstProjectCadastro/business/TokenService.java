package com.Arth.firstProjectCadastro.business;

import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class TokenService {
    @Value("${api.security.secretKey}")
    private String secretKey;
    private static final Logger log = LoggerFactory.getLogger(TokenService.class);

    public String gToken(User usuario) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            String token = JWT.create()
                    .withIssuer("gerador_senha")
                    .withSubject(usuario.getEmail())
                    .withExpiresAt(gExpirateDate())
                    .sign(algorithm);
            return token;
        } catch (JWTCreationException exception) {
            log.error("Erro no lançamento do token", exception);
            throw new RuntimeException("Não foi possível lançar o token", exception);
        }
    }

    public String vToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            return JWT.require(algorithm)
                    .withIssuer("gerador_senha")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            log.error("Erro na verificação do token", exception);
            throw new RuntimeException("Token inválido", exception);
        }
    }

    private Instant gExpirateDate() {
        return Instant.now().plus(2, ChronoUnit.HOURS);
    }
}
