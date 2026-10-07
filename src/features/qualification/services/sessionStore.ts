import { UserSessionState } from "../types";

class SessionStore {
  private sessions = new Map<number, UserSessionState>();
  private readonly TTL_MS = 1000 * 60 * 60 * 2; // 2 horas

  getSession(chatId: number): UserSessionState | undefined {
    const session = this.sessions.get(chatId);
    if (!session) return undefined;

    // Verificar si expiró
    if (Date.now() - session.updatedAt > this.TTL_MS) {
      this.sessions.delete(chatId);
      return undefined;
    }

    return session;
  }

  createOrResetSession(chatId: number): UserSessionState {
    const newSession: UserSessionState = {
      chatId,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      updatedAt: Date.now(),
    };
    this.sessions.set(chatId, newSession);
    return newSession;
  }

  saveAnswer(
    chatId: number,
    questionId: string,
    option: { optionId: string; label: string; points: number },
    nextQuestionIndex: number
  ): UserSessionState {
    const session = this.getSession(chatId) || this.createOrResetSession(chatId);
    session.answers[questionId] = option;
    session.currentQuestionIndex = nextQuestionIndex;
    session.score += option.points;
    session.updatedAt = Date.now();
    this.sessions.set(chatId, session);
    return session;
  }

  clearSession(chatId: number): void {
    this.sessions.delete(chatId);
  }
}

export const sessionStore = new SessionStore();
