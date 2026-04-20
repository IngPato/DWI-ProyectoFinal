
/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.citas.ney.repository;
import com.citas.ney.model.ModelPacientes;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
/**
 *
 * @author GPatr
 */
@Repository
public interface PacienteRepository extends JpaRepository<ModelPacientes, Integer> {
    
    List<ModelPacientes> findByEstadoPaciente(Integer estadoPaciente);
    
    boolean existsByNumeroDocumentoPaciente(String numeroDocumentoPaciente);
    
    Optional<ModelPacientes> findByNumeroDocumentoPaciente(String numeroDocumentoPaciente);

}
