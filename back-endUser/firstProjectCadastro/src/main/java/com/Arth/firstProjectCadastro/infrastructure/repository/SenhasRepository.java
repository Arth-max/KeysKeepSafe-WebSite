package com.Arth.firstProjectCadastro.infrastructure.repositorys;

import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import com.Arth.firstProjectCadastro.infrastructure.entitys.SenhasSalvas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SenhasRepository extends JpaRepository<SenhasSalvas, Integer> {
    List<SenhasSalvas> findByUsuario(User usuario);
    Optional<SenhasSalvas> findByIdAndUsuario(int id, User usuario);
} 
