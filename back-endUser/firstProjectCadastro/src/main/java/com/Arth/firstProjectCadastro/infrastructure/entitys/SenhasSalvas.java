package com.Arth.firstProjectCadastro.infrastructure.entitys;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "senhasUser")
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class SenhasSalvas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String Descricao;

    @Column(nullable = false, length = 500)
    private String SenhaCrypto;

    private LocalDateTime dataCriacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario.email", nullable = false)
    private User usuario;
}
