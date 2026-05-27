package com.spyzer.crm_backend.repository;

import com.spyzer.crm_backend.model.ActividadTrading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActividadTradingRepository extends JpaRepository<ActividadTrading, Long> {

    List<ActividadTrading> findByUsuarioId(Long usuarioId);

    List<ActividadTrading> findTop5ByOrderByFechaActividadDesc();

    List<ActividadTrading> findTop20ByOrderByFechaActividadDesc();

    long countByUsuarioId(Long usuarioId);

    long countByUsuarioIdAndFechaActividadAfter(Long usuarioId, LocalDateTime desde);

    @Query("SELECT COUNT(a) FROM ActividadTrading a WHERE a.fechaActividad >= :desde")
    long countDesde(@Param("desde") LocalDateTime desde);

    @Query("SELECT a.instrumento, SUM(a.cantidad * a.precio) FROM ActividadTrading a WHERE a.fechaActividad >= :desde GROUP BY a.instrumento")
    List<Object[]> volumenPorMonedaDesde(@Param("desde") LocalDateTime desde);

    @Query("SELECT COALESCE(SUM(a.cantidad * a.precio), 0) FROM ActividadTrading a WHERE a.tipo = 'COMPRA'")
    java.math.BigDecimal sumVolumenTotalCompras();
}
