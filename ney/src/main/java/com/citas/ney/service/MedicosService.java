package com.citas.ney.service;

import com.citas.ney.dto.MedicoRequest;
import com.citas.ney.dto.MedicoResponse;
import com.citas.ney.model.ModelEspecialidades;
import com.citas.ney.model.ModelMedicos;
import com.citas.ney.model.ModelRoles;
import com.citas.ney.model.ModelUsuario;
import com.citas.ney.repository.EspecialidadRepository;
import com.citas.ney.repository.MedicosRepository;
import com.citas.ney.repository.RolesRepository;
import com.citas.ney.repository.UsuarioRepository;
import com.citas.ney.security.PasswordGenerator;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author kevin
 */
@Service
@RequiredArgsConstructor
public class MedicosService {

    private final MedicosRepository medicosRepository;
    private final PasswordEncoder passwordEncoder;
    private final RolesRepository rolesRepository;
    private final EspecialidadRepository especialidadRepository;
    private final UsuarioRepository usuarioRepository;

    private MedicoResponse convertirMedico(ModelMedicos medicos) {
        return MedicoResponse.builder()
                .idusuario(medicos.getUsuario().getIdusuario())
                .usuarioMedico(medicos.getUsuario().getUsername())
                .correoMedico(medicos.getUsuario().getCorreo())
                .idespecialidad(medicos.getEspecialidad().getIdespecialidades())
                .especialidad(medicos.getEspecialidad().getNombreEspecialidad())
                .nombresMedico(medicos.getNombresMedico())
                .apellidosMedico(medicos.getApellidosMedico())
                .cmpMedico(medicos.getCmpMedico())
                .telefonoMedico(medicos.getTelefonoMedico())
                .fecha_creacion(medicos.getUsuario().getFechaCreacion())
                .estadoMedico(medicos.getUsuario().getEstadoUsario())
                .build();
    }

    public Page<MedicoResponse> litarMedicosActivos(String filtro, Pageable pageable) {
        Page<ModelMedicos> medicos = medicosRepository.buscarMedicosActivosPaginado(filtro, pageable);
        return medicos.map(this::convertirMedico);
    }

    /*public boolean registrarNuevoMedico(MedicoRequest request) {
        try {
            if (request != null) {
                ModelUsuario usuario = new ModelUsuario();
                usuario.setUsername(request.getUsername());
                usuario.setCorreo(request.getCorreo());
                usuario.setPasswordHash(passwordEncoder.encode(PasswordGenerator.generarPassword(8)));
                usuario.setFechaCreacion(LocalDateTime.now());
                usuario.setEstadoUsario(1);
                ModelRoles rol = rolesRepository.findById(request.getIdRol()).orElseThrow(() -> new RuntimeException("Rol no Existe"));
                usuario.setRol(rol);

                ModelMedicos medicos = new ModelMedicos();
                medicos.setNombresMedico(request.getNombresMedico());
                medicos.setApellidosMedico(request.getApellidosMedico());
                medicos.setCmpMedico(request.getCmpMedico());
                medicos.setTelefonoMedico(request.getTelefonoMedico());
                ModelEspecialidades especialidades = especialidadRepository.findById(request.getIdespecialidad()).orElseThrow(() -> new RuntimeException("Especialidad no existe"));
                medicos.setEspecialidad(especialidades);

                medicos.setUsuario(usuario);
                usuario.setMedico(medicos);

                usuarioRepository.save(usuario);
                return true;
            } else {
                throw new RuntimeException("no hay datos para recibir");
            }
        } catch (Exception e) {
            return false;
        }
    }*/
    @Transactional
    public String registrarNuevoMedico(MedicoRequest request) {

        if (request == null) {
            throw new RuntimeException("No hay datos para registrar");
        }
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El username ya está registrado");
        }
        if (medicosRepository.existsByCmpMedico(request.getCmpMedico())) {
            throw new RuntimeException("El CMP ya está registrado");
        }
        try {
            String contrasena = PasswordGenerator.generarPassword(8);

            ModelRoles rol = rolesRepository.findById(request.getIdRol())
                    .orElseThrow(() -> new RuntimeException("Rol no existe"));

            ModelEspecialidades especialidad = especialidadRepository.findById(request.getIdespecialidad())
                    .orElseThrow(() -> new RuntimeException("Especialidad no existe"));

            ModelUsuario usuario = new ModelUsuario();
            usuario.setUsername(request.getUsername());
            usuario.setCorreo(request.getCorreo());
            usuario.setPasswordHash(passwordEncoder.encode(contrasena));
            usuario.setFechaCreacion(LocalDateTime.now());
            usuario.setEstadoUsario(1);
            usuario.setRol(rol);

            ModelMedicos medico = new ModelMedicos();
            medico.setNombresMedico(request.getNombresMedico());
            medico.setApellidosMedico(request.getApellidosMedico());
            medico.setCmpMedico(request.getCmpMedico());
            medico.setTelefonoMedico(request.getTelefonoMedico());
            medico.setEspecialidad(especialidad);

            medico.setUsuario(usuario);
            usuario.setMedico(medico);

            usuarioRepository.save(usuario);

            return contrasena;

        } catch (Exception e) {
            throw new RuntimeException("Error al registrar médico: " + e.getMessage());
        }
    }

    public boolean actualziarMedico(Integer id, MedicoRequest request) {
        try {
            ModelUsuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Medico no encontrado"));
            usuario.setUsername(request.getUsername());
            usuario.setCorreo(request.getCorreo());
            ModelMedicos medicos = new ModelMedicos();

            medicos.setNombresMedico(request.getNombresMedico());
            medicos.setApellidosMedico(request.getApellidosMedico());
            medicos.setCmpMedico(request.getCmpMedico());
            medicos.setTelefonoMedico(request.getTelefonoMedico());
            ModelEspecialidades especialidades = especialidadRepository.findById(request.getIdespecialidad()).orElseThrow(() -> new RuntimeException("Especialidad no existe"));
            medicos.setEspecialidad(especialidades);

            medicos.setUsuario(usuario);
            usuario.setMedico(medicos);

            usuarioRepository.save(usuario);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e);
        }
    }
}
