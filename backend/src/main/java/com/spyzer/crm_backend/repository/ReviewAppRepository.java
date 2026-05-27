package com.spyzer.crm_backend.repository;

import com.spyzer.crm_backend.model.ReviewApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewAppRepository extends JpaRepository<ReviewApp, Long> {

    List<ReviewApp> findByUsuarioId(Long usuarioId);

    List<ReviewApp> findBySentimientoIaIsNull();

    @Query("SELECT AVG(r.calificacionEstrellas) FROM ReviewApp r")
    Double calcularPromedioCalificacion();

    long countBySentimientoIa(String sentimientoIa);
}
