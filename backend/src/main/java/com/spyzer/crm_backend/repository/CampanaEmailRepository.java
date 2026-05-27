package com.spyzer.crm_backend.repository;

import com.spyzer.crm_backend.model.CampanaEmail;
import com.spyzer.crm_backend.model.CampanaEmail.EstadoCampana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampanaEmailRepository extends JpaRepository<CampanaEmail, Long> {

    List<CampanaEmail> findByEstado(EstadoCampana estado);

    List<CampanaEmail> findTop3ByEstadoOrderByFechaEnvioDesc(EstadoCampana estado);

    List<CampanaEmail> findTop10ByEstadoOrderByFechaEnvioDesc(EstadoCampana estado);

    @Query("SELECT c FROM CampanaEmail c WHERE c.destinatarios LIKE %:email%")
    List<CampanaEmail> findByDestinatariosContaining(@Param("email") String email);
}
