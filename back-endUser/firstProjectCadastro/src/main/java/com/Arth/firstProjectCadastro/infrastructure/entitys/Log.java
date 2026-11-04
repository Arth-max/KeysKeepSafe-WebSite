package com.Arth.firstProjectCadastro.infrastructure.entitys;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "LogAPI")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "descricao_Log", length = 500)
    private String descricao;

    @Column(name = "acao_log", length = 50)
    private String acao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="usuario.id", nullable = false)
    private User usuario;

    @Column
    private LocalDateTime horario;
}
