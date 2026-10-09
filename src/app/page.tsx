import { CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Bot, Settings, Smartphone } from "lucide-react";
import { DEFAULT_QUALIFICATION_CONFIG } from "@/features/qualification/services/qualificationEngine";

export default function Home() {
  const config = DEFAULT_QUALIFICATION_CONFIG;
  const isTokenConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const whatsappNumber = process.env.WHATSAPP_NUMBER || config.whatsappNumber;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="border-b border-slate-800 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-500/20">
              <Bot className="w-4 h-4" /> Asistente de Crédito Vehicular
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Precalificador Vehicular Telegram → WhatsApp
            </h1>
            <p className="text-slate-400 mt-2 text-base md:text-lg">
              Filtra y clasifica prospectos en automático: Crédito Bancario vs Financiamiento Directo (con Infocorp).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                isTokenConfigured
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isTokenConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {isTokenConfigured ? "Bot de Telegram Conectado" : "Token Pendiente"}
            </span>
          </div>
        </header>

        {/* Configuration Summary Cards */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Criterio de Aprobación</h3>
            <p className="text-slate-400 text-sm">
              Umbral mínimo para derivación a WhatsApp:
            </p>
            <div className="text-2xl font-black text-blue-400">
              {config.approvalScore} / 100 <span className="text-xs font-normal text-slate-400">puntos</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Destino de Cierre</h3>
            <p className="text-slate-400 text-sm">
              Los prospectos aprobados reciben el link a:
            </p>
            <div className="text-xl font-mono font-bold text-emerald-400 truncate">
              +{whatsappNumber}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Arquitectura Agnóstica</h3>
            <p className="text-slate-400 text-sm">
              Canal activo: <strong>Telegram</strong>. Desacoplado para expansión directa a <strong>WhatsApp</strong>.
            </p>
            <div className="text-xs font-semibold text-purple-400">
              {config.questions.length} preguntas interactivas
            </div>
          </div>
        </section>

        {/* Qualification Questions Flow */}
        <section className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Flujo de Precalificación Vehicular (Perú)
            </h2>
            <span className="text-xs text-slate-400 font-mono">/api/telegram/webhook</span>
          </div>

          <div className="space-y-6">
            {config.questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="font-semibold text-slate-200">
                  {q.title}
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/40 text-xs flex flex-col justify-between gap-1"
                    >
                      <span className="text-slate-300 font-medium">{opt.label}</span>
                      <span className="text-emerald-400 font-mono font-bold self-end">
                        +{opt.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps to Connect Telegram Webhook */}
        <section className="p-8 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-900/40 space-y-4">
          <h2 className="text-xl font-bold text-white">¿Cómo vincular tu Bot de Telegram?</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
            <li>
              Asegúrate de que tu aplicación esté desplegada o expuesta con una URL pública HTTPS (ej. Vercel o ngrok).
            </li>
            <li>
              Visita en tu navegador:
              <code className="block mt-1 p-2 rounded bg-black/50 text-blue-300 font-mono text-xs overflow-x-auto">
                https://TU-DOMINIO.vercel.app/api/telegram/webhook?setUrl=https://TU-DOMINIO.vercel.app/api/telegram/webhook
              </code>
            </li>
            <li>
              Abre tu bot en Telegram, escribe <code className="text-emerald-300 font-mono">/start</code> y prueba el flujo con botones interactivos.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
