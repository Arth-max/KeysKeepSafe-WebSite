package com.Arth.firstProjectCadastro.infrastructure.repositorys;

import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail (String email);

    @Transactional
    void delete(User usuario);
}
