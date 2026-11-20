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
    private String descricao;

    @Column(nullable = false, length = 500)
    private String senhaCrypto;

    private LocalDateTime dataCriacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;
}
