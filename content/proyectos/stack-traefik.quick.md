# Stack Traefik

**Infra con Docker y Traefik como reverse proxy** para servir múltiples servicios con TLS automático, reglas por host/path y despliegue reproducible.

## Contexto y objetivos
Se necesitaba un **edge router** único con certificados, rutas limpias y fácil mantenimiento.
- HTTPS automático (ACME/Let’s Encrypt).