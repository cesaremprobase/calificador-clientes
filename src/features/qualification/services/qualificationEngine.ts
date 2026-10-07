import { QualificationConfig, SurveyQuestion, UserSessionState, EvaluationResult } from "../types";

export const DEFAULT_QUALIFICATION_CONFIG: QualificationConfig = {
  id: "b2b-services-default",
  name: "Servicios Profesionales B2B",
  welcomeMessage:
    "¡Hola! 👋 Bienvenido a nuestro asistente de atención rápida.\n\nPara poder brindarte la mejor asesoría y conectarte con el especialista indicado, te haremos 3 preguntas rápidas (toma menos de 1 minuto).",
  approvalScore: 60,
  whatsappNumber: process.env.WHATSAPP_NUMBER || "51900475318",
  questions: [
    {
      id: "req_type",
      title: "1️⃣ ¿Qué tipo de servicio o proyecto necesitas?",
      options: [
        { id: "new", label: "✨ Proyecto / Servicio Nuevo", points: 30 },
        { id: "upgrade", label: "⚡ Mejora / Optimización de algo existente", points: 30 },
        { id: "consult", label: "💡 Asesoría o resolver dudas puntuales", points: 15 },
      ],
    },
    {
      id: "budget",
      title: "2️⃣ ¿Cuál es tu rango de presupuesto estimado?",
      options: [
        { id: "b_low", label: "Menos de $10 USD", points: 0 },
        { id: "b_mid_low", label: "$10 a $50 USD", points: 20 },
        { id: "b_mid_high", label: "$50 a $200 USD", points: 35 },
        { id: "b_high", label: "Más de $200 USD", points: 40 },
      ],
    },
    {
      id: "timeline",
      title: "3️⃣ ¿En qué plazo te gustaría comenzar?",
      options: [
        { id: "t_urgent", label: "🚀 De inmediato (esta semana)", points: 30 },
        { id: "t_soon", label: "📅 Próximas semanas", points: 20 },
        { id: "t_future", label: "🔍 Solo estoy explorando opciones", points: 10 },
      ],
    },
  ],
  qualifiedMessageTemplate:
    "🎉 *¡Excelente noticia! Tu perfil califica para atención personalizada.*\n\nHemos analizado tus requerimientos y podemos ayudarte de inmediato con tu proyecto.",
  disqualifiedMessage:
    "🙏 *¡Muchas gracias por tu tiempo e interés!*\n\nActualmente nuestros servicios están orientados a proyectos con un presupuesto base a partir de $10 USD. Te invitamos a seguir nuestros canales y redes para novedades y promociones futuras.",
};

export class QualificationEngine {
  private config: QualificationConfig;

  constructor(config: QualificationConfig = DEFAULT_QUALIFICATION_CONFIG) {
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
        details.push(`• *${question.title.split(" ")[1] || "Tema"}*: ${answer.label}`);
      }
    }

    const isQualified = score >= this.config.approvalScore;

    let whatsappUrl: string | undefined = undefined;
    if (isQualified) {
      const cleanPhone = (process.env.WHATSAPP_NUMBER || this.config.whatsappNumber).replace(/\D/g, "");
      const answersText = Object.values(session.answers)
        .map((a) => a.label)
        .join(" | ");

      const prefilledMessage =
        `Hola, completé la evaluación en el bot con un puntaje de ${score}/100.\n` +
        `Mis requerimientos son: ${answersText}.\n` +
        `Me gustaría coordinar con un asesor.`;

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
