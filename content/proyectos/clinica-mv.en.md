#MV Diet Clinic

Web platform for diet clinics that centralizes appointments, video consultations, and document management with role-based control.

## Context and Objective
- Clinics with disparate processes (schedule, video, documents).
- Objective: Unify and reduce no-shows with reminders.

## My Role and Scope
- **Backend (Laravel)**: REST API, Sanctum, Spatie Roles, logs.
- **Frontend (Angular)**: Monthly calendar, accessible modals.
- **DevOps**: Docker Compose, proxy, cloud deployment.

## Stack and Architecture
- **BE**: Laravel · Sanctum · Spatie
- **FE**: Angular standalone · FullCalendar
- **Infra**: Docker · Nginx/Traefik · MySQL
- **Video**: Embedded Jitsi

## Challenges → Solutions
- **Granular access** → policies + middleware per resource.
- **Frictionless video** → Helper that opens a room with a token.
- **Secure download** → Signed URLs and role-based verification.

## Results and Metrics
- Appointment booking in **< 30 s**.
- Core Web Vitals in **green** (LCP < 2.5 s).
- **-18%** no-shows with reminders.

## Gallery
#### Monthly Calendar
<p align="center">
<img src="/assets/proyectos/clinica-mv/calendario.png" alt="Calendar Image" width="300">
</p>

<!-- ![Calendar](/assets/projects/clinica-mv/calendar.png) -->
#### Patient History Record
<p align="center">
<img src="/assets/proyectos/clinica-mv/historiales.png" alt="History Image" width="300">
</p>

<!-- ![History](/assets/projects/clinica-mv/histories.png) -->
#### Video Calls Within the Platform
<p align="center">
<img src="/assets/proyectos/clinica-mv/Videollamada.png" alt="Videocall image" width="300">
</p>

<!-- ![Videocall](/assets/projects/clinica-mv/Videocall.png) -->

## Links
- **Demo**: https://www.clinicamv.lol
- **Repository**: https://github.com/SebasRodMag/ClinicaDieteticaMV