import * as fs from "fs";
import OpenAI from "openai";

/**
 * Make sure you set your OPENAI_API_KEY in the environment,
 * e.g. export OPENAI_API_KEY="sk-..."
 */
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("ERROR: Missing OpenAI API Key. Set OPENAI_API_KEY in your environment.");
  process.exit(1);
}

/**
 * Initialize the OpenAI client
 */
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Represents a line in the WhatsApp conversation.
 */
interface ChatLine {
  date: string;
  time: string;
  sender: string;
  message: string;
}

/**
 * Regex to match typical WhatsApp lines like:
 * [26/07/23, 09:58:53] John Doe: Hello there
 */
const lineRegex = /^\[(\d{2}\/\d{2}\/\d{2}),\s(\d{2}:\d{2}:\d{2})\]\s([^:]+):\s([\s\S]+)/;

/**
 * Parse the raw WhatsApp text into structured ChatLine objects.
 */
function parseWhatsappText(text: string): ChatLine[] {
  return text
    .split("\n")
    .map((line) => {
      const match = lineRegex.exec(line.trim());
      if (match) {
        const [, date, time, sender, message] = match;
        return { date, time, sender, message };
      }
      return null;
    })
    .filter((item): item is ChatLine => item !== null);
}

/**
 * For chat-based fine-tuning, each JSON line should have:
 * {
 *   "messages": [
 *     { "role": "system", "content": "...instructions..." },
 *     { "role": "user", "content": "...some text..." },
 *     { "role": "assistant", "content": "...the next line's response..." }
 *   ]
 * }
 *
 * We'll build these from pairs of consecutive lines in the chat.
 */
interface FineTuneChatExample {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
}

/**
 * Build the chat-based fine-tuning examples.
 *
 * Each pair of consecutive lines becomes a single training example:
 * - We add a system message with your "persona" or "instructions".
 * - We treat the current line as "user" content.
 * - We treat the *next* line as "assistant" content.
 *
 * You can customize how you segment or skip lines here.
 */
function buildChatExamples(chat: ChatLine[]): FineTuneChatExample[] {
  const examples: FineTuneChatExample[] = [];

  for (let i = 0; i < chat.length - 1; i++) {
    const current = chat[i];
    const next = chat[i + 1];

    // Skip lines with "immagine omessa" or empty text
    if (
      !current.message ||
      current.message.toLowerCase().includes("immagine omessa") ||
      !next.message ||
      next.message.toLowerCase().includes("immagine omessa")
    ) {
      continue;
    }

    const systemContent =
      `You are ${next.sender} in a WhatsApp conversation. ` +
      `Respond naturally in ${next.sender}'s communication style and personality. ` +
      `Keep responses conversational and match the tone of the chat.`;

    const userContent = `${current.sender}: ${current.message}`;
    const assistantContent = `${next.message}`;

    examples.push({
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
        { role: "assistant", content: assistantContent },
      ],
    });
  }

  return examples;
}

/**
 * Write the chat examples to a JSONL file in the format required for
 * chat-based fine-tuning.
 */
function writeJsonlFile(examples: FineTuneChatExample[], outputPath: string) {
  const lines = examples.map((ex) => JSON.stringify(ex));
  fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");
}

async function main() {
  try {
    // 1. Parse the raw WhatsApp text
    console.log("⏳ Parsing whatsapp.txt...");
    const rawText = fs.readFileSync("whatsapp.txt", "utf-8");
    const chatLines = parseWhatsappText(rawText);

    // 2. Build the chat format
    console.log("⏳ Building chat-based examples...");
    const examples = buildChatExamples(chatLines);

    // 3. Save to JSONL
    const trainingFilePath = "training_data.jsonl";
    writeJsonlFile(examples, trainingFilePath);
    console.log(`✅ Created JSONL file at: ${trainingFilePath}`);

    // 4. Upload the file to OpenAI
    console.log("📤 Uploading file for fine-tuning...");
    const fileRes = await openai.files.create({
      file: fs.createReadStream(trainingFilePath),
      purpose: "fine-tune",
    });
    console.log("File uploaded successfully! File ID:", fileRes.id);

    // 5. Create the fine-tuning job
    //    Use one of the supported models for chat-based fine-tuning.
    //    e.g. "gpt-3.5-turbo-0613", "gpt-3.5-turbo-1106", "gpt-4-0613", etc.
    console.log("🚀 Creating chat fine-tuning job...");
    const fineTuneRes = await openai.fineTuning.jobs.create({
      training_file: fileRes.id,
      model: "gpt-4o-mini-2024-07-18",
      // optional parameters, e.g.:
      // validation_file: ...,
      // hyperparameters: { n_epochs: 3 },
      // suffix: "whatsapp-model",
    });

    console.log("✅ Fine-tuning job started!");
    console.log("Fine-tune job ID:", fineTuneRes.id);
    console.log("Status:", fineTuneRes.status);
  } catch (error: any) {
    console.error("❌ ERROR OCCURRED");
    if (error.response) {
      console.error("🔴 Status:", error.response.status);
      console.error("🔴 Headers:", error.response.headers);
      console.error("🔴 Data:", error.response.data);
    } else {
      console.error("⚠️", error.message);
    }
    console.error("Stack Trace:", error.stack);
  }
}

// Run the script
main();
