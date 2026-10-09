# BUSINESS_LOGIC.md - SaaS de Precalificación Vehicular (Telegram → WhatsApp)

## 1. Visión del Negocio
Embudo automatizado de precalificación para empresas y asesores de **financiamiento vehicular** en Perú. Recibe prospectos provenientes de campañas (Facebook Ads / Instagram / TikTok) y realiza un triaje ágil en Telegram antes de derivarlos al WhatsApp Business del asesor con su ficha completa de crédito.

---

## 2. Segmentación de Rutas de Financiamiento

A diferencia de un banco tradicional, el negocio atiende a **ambos perfiles**:
1. **Ruta Bancaria / Cajas (Sin reporte negativo):**
   - Para clientes 100% limpios o con deudas al día.
   - Acceso a tasas competitivas bancarias.
2. **Ruta Financiamiento Directo / Alternativo (Con reporte en Infocorp):**
   - Para clientes con deudas castigadas o historial crediticio manchado.
   - Requiere cuota inicial mínima (desde S/ 5,000 en adelante) para mitigar riesgo.

---

## 3. Cuestionario Interactivo (6 Pasos Ágiles)

1. **Tipo de Solicitante:**
   - 👤 Persona Natural (+20 pts)
   - 🏢 Como Empresa (RUC 20) (+25 pts)
2. **Situación Laboral e Ingresos:**
   - 📄 En Planilla (con boletas) (+25 pts)
   - 💼 Independiente / Negocio (RUC) (+25 pts)
   - 💵 Ingresos en efectivo / Sin sustento formal (+15 pts)
3. **Historial en Infocorp:**
   - ✅ 100% Limpio / Al día (+25 pts)
   - ⚖️ Con deudas en bancos pero al día (+20 pts)
   - ⚠️ Con reporte en Infocorp (+15 pts) *(Activa ruta alternativa)*
4. **Capital para Cuota Inicial:**
   - Menos de S/ 5,000 (0 pts - Requiere ahorro previo)
   - S/ 5,000 a S/ 15,000 (+20 pts)
   - S/ 15,000 a S/ 30,000 (+25 pts)
   - Más de S/ 30,000 (+30 pts)
5. **Preferencia de Transmisión:**
   - 🚗 Automática (+10 pts)
   - ⚙️ Mecánica (+10 pts)
   - 🔄 Abierto a ambas (+10 pts)
6. **Urgencia de Compra:**
   - 🚀 De inmediato (este mes) (+20 pts)
   - 📅 Próximos 2 a 3 meses (+15 pts)
   - 🔍 Solo cotizando información (+5 pts)

---

## 4. Regla de Handoff a WhatsApp

### Calificado (Score >= 50 y Cuota Inicial >= S/ 5,000)
El bot genera el botón con mensaje precargado para el asesor:
```
Hola, completé la precalificación vehicular en el bot.

📋 PERFIL DEL SOLICITANTE:
- Persona Natural
- En Planilla (Boletas de pago)
- 100% Limpio / Al día
- S/ 15,000 a S/ 30,000
- Automática
- De inmediato (este mes)

🎯 Ruta: Crédito Tradicional Bancario / Caja

Deseo que me contacte un asesor para ver las unidades y cuotas disponibles.
```
