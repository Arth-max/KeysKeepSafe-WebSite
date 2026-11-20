package com.Arth.firstProjectCadastro.infrastructure.entitys;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "Usuario")
@Entity()
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "senha", nullable = false, length = 255)
    private String senha;

    private String codigoRecuperacao;
    private LocalDateTime codExpiracao;
    private String urlImg;
}
