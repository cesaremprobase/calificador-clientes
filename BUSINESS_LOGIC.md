# BUSINESS_LOGIC.md - SaaS de Calificación y Enrutamiento de Clientes

## 1. Visión del Producto
Plataforma SaaS que automatiza la precalificación de prospectos entrantes a través de mensajería (Telegram inicialmente, extensible a WhatsApp) mediante flujos interactivos guiados por botones, transfiriendo a los prospectos calificados directamente al WhatsApp comercial del negocio con su contexto precargado.

Diseñado con enfoque **Config-Driven** (basado en configuración/datos) para replicarse en múltiples giros de negocio sin tocar código.

---

## 2. Arquitectura de Dominio (Hexagonal / Desacoplada)

```
[ Canal: Telegram Bot ]  ───┐
                            ├──► [ Adaptador de Canal ] ──► [ Motor de Calificación ]
[ Canal: WhatsApp API ]  ───┘        (Normalizador)            (Agnóstico / Core)
                                                                     │
                                                                     ▼
                                                         [ Evaluación de Puntaje ]
                                                                     │
                                             ┌───────────────────────┴───────────────────────┐
                                             ▼                                               ▼
                                      [ CALIFICADO ]                                 [ DESCALIFICADO ]
                                      (Score >= 60)                                   (Score < 60)
                                             │                                               │
                                 Genera link directo a                        Mensaje de despedida
                                 WhatsApp con resumen                         o recursos generales
```

---

## 3. Flujo Inicial y Mensaje de Bienvenida (`/start`)

Cuando el usuario inicia el bot o envía el comando `/start`:
- **Mensaje:**
  > *"¡Hola! 👋 Bienvenido a nuestro asistente de atención rápida.\n\nPara poder brindarte la mejor asesoría y conectarte con el especialista indicado, te haremos 3 preguntas rápidas (toma menos de 1 minuto)."*
- **Acción:**
  - Botón interactivo: `[ Comenzar Evaluación 🚀 ]` (o despliegue directo de la Pregunta 1).

---

## 4. Esquema Configurable de Calificación (Ajustado)

### Criterio de Corte
- **Puntaje mínimo aprobatorio:** **60 / 100 puntos** (permite captar clientes interesados con dudas o ticket inicial).

### Preguntas del Flujo:

1. **Pregunta 1: Tipo de Requerimiento**
   - *Opciones:*
     - A) Proyecto o servicio nuevo (+30 pts)
     - B) Mejora / Optimización de algo existente (+30 pts)
     - C) Solo busco asesoría o resolver dudas (+15 pts)

2. **Pregunta 2: Rango de Presupuesto Estimado**
   - *Opciones:*
     - A) Menos de $10 USD (0 pts - Por debajo del umbral mínimo de atención)
     - B) $10 a $50 USD (+20 pts)
     - C) $50 a $200 USD (+35 pts)
     - D) Más de $200 USD (+40 pts)

3. **Pregunta 3: Plazo de Inicio (Urgencia)**
   - *Opciones:*
     - A) Inmediato (esta semana o mes) (+30 pts)
     - B) Próximas semanas (+20 pts)
     - C) Solo estoy explorando a futuro (+10 pts)

---

## 5. Lógica de Enrutamiento y Handoff

### Escenario A: Prospecto Calificado (Puntaje >= 60)
1. El bot confirma que su solicitud es viable para atención personalizada.
2. Presenta un botón interactivo: **"💬 Hablar con un Asesor por WhatsApp"**.
3. El enlace se genera dinámicamente:
   ```
   https://wa.me/{WHATSAPP_NUMBER}?text={MENSAJE_CODIFICADO}
   ```
   **Contenido del mensaje pre-cargado:**
   > *"Hola, completé la evaluación en el bot. Mi interés es: [Tipo], presupuesto estimado: [Rango] y plazo: [Plazo]. Deseo coordinar con un asesor."*

### Escenario B: Prospecto No Calificado (Puntaje < 60)
1. El bot agradece el tiempo educadamente.
2. Mensaje empático:
   > *"¡Gracias por tu interés! Por el momento nuestros servicios requieren un presupuesto mínimo a partir de $10 USD. Te invitamos a seguir nuestros canales y recursos para futuras novedades."*

---

## 6. Escalabilidad a Nuevos Giros
Cada cuenta/empresa podrá configurar en su panel:
- Número de WhatsApp de destino.
- Mensaje de bienvenida inicial (`/start`).
- Preguntas, opciones, rangos y puntajes.
- Umbral de aprobación (por defecto 60).
