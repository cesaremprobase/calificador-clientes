import { QualificationConfig, SurveyQuestion, UserSessionState, EvaluationResult } from "../types";

export const AUTO_FINANCING_CONFIG: QualificationConfig = {
  id: "auto-financing-peru",
  name: "Precalificación de Financiamiento Vehicular",
  welcomeMessage:
    "¡Hola! 👋 Bienvenido a nuestro asesor virtual de financiamiento vehicular.\n\nTe ayudaremos a encontrar el financiamiento ideal para tu auto (bancario o directo, incluso si tienes reporte en Infocorp).\n\nSolo te tomará 45 segundos responder unas breves preguntas.",
  approvalScore: 50,
  whatsappNumber: process.env.WHATSAPP_NUMBER || "51900475318",
  questions: [
    {
      id: "applicant_type",
      title: "1️⃣ ¿Cómo solicitarías el financiamiento?",
      options: [
        { id: "natural", label: "👤 Persona Natural", points: 20 },
        { id: "juridica", label: "🏢 Como Empresa (RUC 20)", points: 25 },
      ],
    },
    {
      id: "employment_type",
      title: "2️⃣ ¿Cuál es tu situación laboral e ingresos?",
      options: [
        { id: "dependiente", label: "📄 En Planilla (Boletas de pago)", points: 25 },
        { id: "independiente", label: "💼 Independiente / Negocio (RUC)", points: 25 },
        { id: "informal", label: "💵 Ingresos en efectivo / Sin sustento", points: 15 },
      ],
    },
    {
      id: "infocorp_status",
      title: "3️⃣ ¿Cómo se encuentra tu historial crediticio en Infocorp?",
      options: [
        { id: "limpio", label: "✅ 100% Limpio / Al día", points: 25 },
        { id: "deudas_ok", label: "⚖️ Con deudas en bancos pero al día", points: 20 },
        { id: "reportado", label: "⚠️ Con reporte en Infocorp", points: 15 },
      ],
    },
    {
      id: "capital_initial",
      title: "4️⃣ ¿Con cuánto capital cuentas para tu cuota inicial?",
      options: [
        { id: "cap_low", label: "Menos de S/ 5,000", points: 5 },
        { id: "cap_mid", label: "S/ 5,000 a S/ 15,000", points: 20 },
        { id: "cap_high", label: "S/ 15,000 a S/ 30,000", points: 25 },
        { id: "cap_plus", label: "Más de S/ 30,000", points: 30 },
      ],
    },
    {
      id: "transmission",
      title: "5️⃣ ¿Qué tipo de transmisión prefieres para tu vehículo?",
      options: [
        { id: "auto", label: "🚗 Automática", points: 10 },
        { id: "mecanica", label: "⚙️ Mecánica", points: 10 },
        { id: "ambas", label: "🔄 Abierto a ambas opciones", points: 10 },
      ],
    },
    {
      id: "urgency",
      title: "6️⃣ ¿En qué plazo piensas adquirir la unidad?",
      options: [
        { id: "urg_inmediato", label: "🚀 De inmediato (este mes)", points: 20 },
        { id: "urg_proximo", label: "📅 Próximos 2 a 3 meses", points: 15 },
        { id: "urg_info", label: "🔍 Solo estoy cotizando información", points: 5 },
      ],
    },
  ],
  qualifiedMessageTemplate:
    "🎉 *¡Excelente! Hemos verificado tu perfil y tienes opciones viables de financiamiento.*",
  disqualifiedMessage:
    "🙏 *Gracias por tu tiempo e interés.*\n\nPara acceder a los planes vehiculares actuales se requiere contar con una cuota inicial mínima a partir de S/ 5,000. Te invitamos a comunicarte cuando reúnas el monto base para la inicial.",
};

export const DEFAULT_QUALIFICATION_CONFIG = AUTO_FINANCING_CONFIG;

export class QualificationEngine {
  private config: QualificationConfig;

  constructor(config: QualificationConfig = AUTO_FINANCING_CONFIG) {
    this.config = config;
  }

  getConfig(): QualificationConfig {
    return this.config;
  }

  getQuestion(index: number): SurveyQuestion | null {
    if (index >= 0 && index < this.config.questions.length) {
      return this.config.questions[index];
    }
    return null;
  }

  getTotalQuestions(): number {
    return this.config.questions.length;
  }

  evaluate(session: UserSessionState): EvaluationResult {
    let score = 0;
    const details: string[] = [];

    for (const question of this.config.questions) {
      const answer = session.answers[question.id];
      if (answer) {
        score += answer.points;
        const shortTitle = question.title.split(" ")[1] || "Opción";
        details.push(`• *${shortTitle}*: ${answer.label}`);
      }
    }

    // Regla de negocio: si tiene inicial muy baja (< S/5000) y solo cotiza, no califica de inmediato
    const capitalAnswer = session.answers["capital_initial"]?.id;
    const isVeryLowCapital = capitalAnswer === "cap_low";

    // Si tiene al menos S/ 5,000 de inicial y score >= 50, califica
    const isQualified = score >= this.config.approvalScore && !isVeryLowCapital;

    let whatsappUrl: string | undefined = undefined;
    if (isQualified) {
      const cleanPhone = (process.env.WHATSAPP_NUMBER || this.config.whatsappNumber).replace(/\D/g, "");

      // Determinar la ruta recomendada según su Infocorp
      const infocorpAns = session.answers["infocorp_status"]?.id;
      const lineaSugerida =
        infocorpAns === "reportado"
          ? "Ruta: Financiamiento Directo / Alternativo (Con reporte)"
          : "Ruta: Crédito Tradicional Bancario / Caja";

      const answersSummary = Object.values(session.answers)
        .map((a) => a.label)
        .join("\n- ");

      const prefilledMessage =
        `Hola, completé la precalificación vehicular en el bot.\n\n` +
        `📋 *PERFIL DEL SOLICITANTE:*\n- ${answersSummary}\n\n` +
        `🎯 *${lineaSugerida}*\n\n` +
        `Deseo que me contacte un asesor para ver las unidades y cuotas disponibles.`;

      whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(prefilledMessage)}`;
    }

    return {
      score,
      isQualified,
      summaryText: details.join("\n"),
      whatsappUrl,
    };
  }
}

export const qualificationEngine = new QualificationEngine();
