import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const ROOMS = {
  general: {
    topic: "A casual Pakistani community group for everyday conversation.",
    members: [
      "Ayesha Khan: warm, observant, from Karachi; writes natural Roman Urdu and occasional English.",
      "Hamza Ali: friendly, lightly humorous, from Lahore; concise and never sounds like customer support.",
    ],
  },
  engineering: {
    topic: "A Pakistani software engineering team discussing real development work.",
    members: [
      "Saad Dev: senior backend engineer; direct, practical, uses technical English mixed with Roman Urdu.",
      "Maham Raza: frontend engineer; thoughtful, asks useful follow-ups, concise and collaborative.",
    ],
  },
  random: {
    topic: "A relaxed Pakistani friends group about cricket, food, weekends, memes, and daily life.",
    members: [
      "Bilal Ahmed: cricket fan with dry humor; casual Roman Urdu.",
      "Zoya Khan: lively and witty; natural Urdu-English mix without overdoing slang.",
    ],
  },
};

function extractOutput(data) {
  return (data.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();
}

function chatApi(env) {
  return {
    name: "pak-chat-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        if (!env.GEMINI_API_KEY) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: "GEMINI_API_KEY is not configured. Add it to .env.local and restart the app." }));
          return;
        }

        try {
          let raw = "";
          for await (const chunk of req) raw += chunk;
          const { roomId = "general", messages = [] } = JSON.parse(raw || "{}");
          const room = ROOMS[roomId] || ROOMS.general;
          const recent = messages.slice(-20);
          const lastAssistant = [...recent].reverse().find((message) => message.role === "assistant")?.name;

          const transcript = recent.map((message) =>
            `${message.role === "user" ? "You" : message.name || "Member"}: ${message.text}`
          ).join("\n");

          const instructions = `You are simulating one believable participant in a private WhatsApp-style Pakistani group chat.
Room: ${room.topic}
Members:
${room.members.join("\n")}

Reply to the newest message while remembering the whole transcript. Choose exactly one listed member to speak. Do not choose ${lastAssistant || "the same person repeatedly"} if another member can naturally reply.
Sound like a real friend or colleague, not an AI, assistant, host, or customer-support agent. Use natural Roman Urdu and English in the same style as the user. Keep it usually 2-18 words; sometimes ask a relevant follow-up. Do not greet again unless greeted. Do not paraphrase the user's message. Do not give generic acknowledgements. Never repeat an earlier response. Use at most one emoji and only when natural.
Return one JSON object with exactly two fields: speaker and text.`;

          const model = env.GEMINI_MODEL || "gemini-3.5-flash";
          const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": env.GEMINI_API_KEY,
              },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: instructions }] },
                contents: [{
                  role: "user",
                  parts: [{ text: transcript || "You: Start a natural conversation relevant to this room." }],
                }],
                generationConfig: {
                  maxOutputTokens: 2048,
                  thinkingConfig: { thinkingLevel: "low" },
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: "OBJECT",
                    properties: {
                      speaker: {
                        type: "STRING",
                        enum: room.members.map((member) => member.split(":")[0]),
                      },
                      text: { type: "STRING" },
                    },
                    required: ["speaker", "text"],
                  },
                },
              }),
            }
          );

          const data = await apiResponse.json();
          if (!apiResponse.ok) {
            const requestId = apiResponse.headers.get("x-goog-request-id");
            console.error("Gemini API error", requestId, data?.error?.message);
            res.statusCode = apiResponse.status;
            res.end(JSON.stringify({ error: data?.error?.message || "AI reply failed", requestId }));
            return;
          }

          const output = extractOutput(data);
          let parsed;
          try {
            parsed = JSON.parse(output.replace(/^```json\s*|\s*```$/g, ""));
          } catch {
            const divider = output.indexOf("|||");
            parsed = divider > 0
              ? { speaker: output.slice(0, divider).trim(), text: output.slice(divider + 3).trim() }
              : null;
          }
          if (!parsed) {
            const reason = data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason || "empty response";
            throw new Error(`Gemini returned no usable chat response (${reason}).`);
          }

          const speaker = String(parsed.speaker || "").trim();
          const text = String(parsed.text || "").trim();
          const validName = room.members.map((member) => member.split(":")[0]).find((name) => name === speaker);
          if (!validName || !text) throw new Error("The model returned an unknown speaker.");

          res.end(JSON.stringify({ speaker: validName, text }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message || "Could not generate a reply. Please try again." }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), chatApi(env)],
    server: { port: 5173 },
  };
});





