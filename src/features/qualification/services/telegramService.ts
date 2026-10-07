import { qualificationEngine } from "./qualificationEngine";
import { sessionStore } from "./sessionStore";
import { SurveyQuestion } from "../types";

export class TelegramService {
  private token: string;
  private apiBase: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || "";
    this.apiBase = `https://api.telegram.org/bot${this.token}`;
  }

  private async callApi(method: string, body: Record<string, unknown>) {
    if (!this.token) {
      console.warn("TELEGRAM_BOT_TOKEN no está configurado.");
      return null;
    }

    try {
      const response = await fetch(`${this.apiBase}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!data.ok) {
        console.error(`Error en Telegram API (${method}):`, data);
      }
      return data;
    } catch (err) {
      console.error(`Error de red llamando a Telegram (${method}):`, err);
      return null;
    }
  }

  async sendMessage(chatId: number, text: string, replyMarkup?: Record<string, unknown>) {
    return this.callApi("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string) {
    return this.callApi("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      ...(text ? { text } : {}),
    });
  }

  async sendWelcome(chatId: number) {
    sessionStore.createOrResetSession(chatId);
    const config = qualificationEngine.getConfig();

    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Comenzar Evaluación 🚀",
            callback_data: "action:start",
          },
        ],
      ],
    };

    return this.sendMessage(chatId, config.welcomeMessage, inlineKeyboard);
  }

  async sendQuestion(chatId: number, questionIndex: number) {
    const question = qualificationEngine.getQuestion(questionIndex);
    if (!question) return null;

    const buttons = question.options.map((opt) => [
      {
        text: opt.label,
        callback_data: `ans:${question.id}:${opt.id}`,
      },
    ]);

    const keyboard = { inline_keyboard: buttons };
    return this.sendMessage(chatId, question.title, keyboard);
  }

  async handleCallbackAnswer(
    chatId: number,
    callbackQueryId: string,
    callbackData: string
  ) {
    await this.answerCallbackQuery(callbackQueryId);

    // Si pulsó iniciar
    if (callbackData === "action:start") {
      sessionStore.createOrResetSession(chatId);
      return this.sendQuestion(chatId, 0);
    }

    // Si seleccionó una respuesta: ans:{questionId}:{optionId}
    if (callbackData.startsWith("ans:")) {
      const [, questionId, optionId] = callbackData.split(":");
      const session = sessionStore.getSession(chatId) || sessionStore.createOrResetSession(chatId);
      const question = qualificationEngine.getQuestion(session.currentQuestionIndex);

      if (!question) {
        return this.sendWelcome(chatId);
      }

      const selectedOption = question.options.find((o) => o.id === optionId);
      if (!selectedOption) return;

      const nextIndex = session.currentQuestionIndex + 1;
      const updatedSession = sessionStore.saveAnswer(chatId, questionId, selectedOption, nextIndex);

      // Si aún hay preguntas pendientes
      if (nextIndex < qualificationEngine.getTotalQuestions()) {
        return this.sendQuestion(chatId, nextIndex);
      }

      // Finalizó el cuestionario -> Evaluar resultado
      const result = qualificationEngine.evaluate(updatedSession);
      const config = qualificationEngine.getConfig();

      if (result.isQualified && result.whatsappUrl) {
        const text =
          `${config.qualifiedMessageTemplate}\n\n` +
          `📊 *Puntaje obtenido:* ${result.score}/100\n\n` +
          `*Resumen de tu solicitud:*\n${result.summaryText}\n\n` +
          `Haz clic abajo para conectarte directamente con nuestro equipo por WhatsApp:`;

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "💬 Hablar con Asesor en WhatsApp",
                url: result.whatsappUrl,
              },
            ],
            [
              {
                text: "🔄 Reiniciar Evaluación",
                callback_data: "action:start",
              },
            ],
          ],
        };

        sessionStore.clearSession(chatId);
        return this.sendMessage(chatId, text, keyboard);
      } else {
        const text =
          `${config.disqualifiedMessage}\n\n` +
          `📊 *Puntaje obtenido:* ${result.score}/100\n\n` +
          `*Resumen evaluado:*\n${result.summaryText}`;

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "🔄 Volver a intentar",
                callback_data: "action:start",
              },
            ],
          ],
        };

        sessionStore.clearSession(chatId);
        return this.sendMessage(chatId, text, keyboard);
      }
    }
  }
}

export const telegramService = new TelegramService();
