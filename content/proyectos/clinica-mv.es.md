# Clínica Dietética MV

Plataforma web para clínicas dietéticas que centraliza citas, videoconsulta y gestión documental con control por rol.

## Contexto y objetivo
- Clínicas con procesos dispersos (agenda, video, documentos).
- Objetivo: unificar y reducir no-shows con recordatorios.

## Mi rol y alcance
- **Backend (Laravel)**: API REST, Sanctum, Spatie Roles, logs.
- **Frontend (Angular)**: calendario mensual, modales accesibles.
- **DevOps**: Docker Compose, proxy, despliegue en cloud.

## Stack y arquitectura
- **BE**: Laravel · Sanctum · Spatie
- **FE**: Angular standalone · FullCalendar
- **Infra**: Docker · Nginx/Traefik · MySQL
- **Video**: Jitsi embebido

## Retos → Soluciones
- **Acceso granular** → políticas + middlewares por recurso.
- **Video sin fricción** → helper que abre sala con token.
- **Descarga segura** → URLs firmadas y verificación por rol.

## Resultados y métricas
- Reserva de cita en **< 30 s**.
- Core Web Vitals en **verde** (LCP < 2.5 s).
- **-18%** no-shows con recordatorios.

## Galería
#### Calendario mensual
<p align="center">
  <img src="/assets/proyectos/clinica-mv/calendario.png" alt="Imagen calendario" width="300">
</p>

<!-- ![Calendario](/assets/proyectos/clinica-mv/calendario.png) -->
#### Registro del historial del paciente
<p align="center">
  <img src="/assets/proyectos/clinica-mv/historiales.png" alt="Imagen historiales" width="300">
</p>

<!-- ![Historial](/assets/proyectos/clinica-mv/historiales.png) -->
#### Videollamadas dentro de la plataforma
<p align="center">
  <img src="/assets/proyectos/clinica-mv/Videollamada.png" alt="Imagen videollamada" width="300">
</p>

<!-- ![Videollamada](/assets/proyectos/clinica-mv/Videollamada.png) -->

## Enlaces
- **Demo**: https://www.clinicamv.lol
- **Repositorio**: https://github.com/SebasRodMag/ClinicaDieteticaMV
