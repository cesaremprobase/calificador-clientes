import { NextRequest, NextResponse } from "next/server";
import { telegramService } from "@/features/qualification/services/telegramService";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. Mensaje de texto (ejemplo: /start)
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text?.trim() || "";

      if (text.startsWith("/start")) {
        await telegramService.sendWelcome(chatId);
      } else {
        // Cualquier otro texto guía al usuario al flujo inicial
        await telegramService.sendWelcome(chatId);
      }
    }

    // 2. Interacción con botones (Callback Query)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message?.chat?.id;
      const callbackQueryId = callbackQuery.id;
      const callbackData = callbackQuery.data;

      if (chatId && callbackData) {
        await telegramService.handleCallbackAnswer(chatId, callbackQueryId, callbackData);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error procesando webhook de Telegram:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Verificación de estado o registro rápido de webhook
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const setUrl = searchParams.get("setUrl");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, message: "TELEGRAM_BOT_TOKEN no configurado" }, { status: 400 });
  }

  // Si se pasa ?setUrl=https://tu-dominio.com/api/telegram/webhook
  if (setUrl) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(setUrl)}`);
      const data = await res.json();
      return NextResponse.json({ ok: true, telegramResponse: data });
    } catch (err) {
      return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  // Obtener información actual del webhook
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const info = await res.json();
    return NextResponse.json({
      status: "Webhook endpoint activo",
      configured: true,
      webhookInfo: info,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
