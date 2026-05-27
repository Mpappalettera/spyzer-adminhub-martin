package com.spyzer.crm_backend.repository;

import com.spyzer.crm_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findTop5ByOrderByFechaRegistroDesc();

    List<Usuario> findTop20ByOrderByFechaRegistroDesc();

    List<Usuario> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);

    @Query("SELECT year(u.fechaRegistro), month(u.fechaRegistro), count(u) " +
           "FROM Usuario u " +
           "WHERE u.fechaRegistro IS NOT NULL " +
           "GROUP BY year(u.fechaRegistro), month(u.fechaRegistro) " +
           "ORDER BY year(u.fechaRegistro), month(u.fechaRegistro)")
    List<Object[]> countRegistrosPorMes();
}
