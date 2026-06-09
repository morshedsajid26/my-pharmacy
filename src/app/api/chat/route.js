import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, sessionId } = body;

    if (!messages || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure session exists
    let session = await prisma.chatSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          sessionId,
          title: "New Chat",
        },
      });
    }

    // Save the latest user message
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "user",
          content: lastUserMessage.content,
        },
      });
    }

    const systemPrompt = `You are an AI Pharmacy Assistant for this specific pharmacy.
Rules:
1. You must search the existing database before generating responses about available medicines.
2. Use ONLY the medicines available in the database returned by the search_medicines tool.
3. NEVER invent medicine names.
4. NEVER diagnose diseases or suggest treatments. If asked about a disease, state clearly that you cannot diagnose and recommend consulting a doctor.
5. NEVER prescribe prescription drugs without warning. If a medicine typically requires a prescription, mention that a prescription is needed.
6. When listing medicines, you MUST return: Name, Generic Name, Price, Available Stock, and Usage Information (infer usage from the category or general knowledge if not in DB).
7. Be concise, polite, and helpful.
8. You must be fully capable of understanding and communicating in Bengali (বাংলা). If the user asks a question in Bengali or mixed English-Bengali (Banglish), you MUST reply in natural, polite Bengali. You can keep medicine brand names and generic names in English.
9. If a user asks for medicines for common issues using colloquial terms (e.g., 'gas', 'gastric', 'pressure', 'fever', 'matha betha', 'pain'), first silently map it to the proper generic name or category (e.g., 'Antacid', 'Omeprazole', 'Antihypertensive', 'Paracetamol', 'Analgesic'). Then use those medical terms as the query in the search_medicines tool to find actual matches in the database.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      tools: [{
        functionDeclarations: [{
          name: "search_medicines",
          description: "Search the pharmacy inventory for medicines by keyword (e.g., name, category, generic name, or symptom).",
          parameters: {
            type: "OBJECT",
            properties: {
              query: {
                type: "STRING",
                description: "The search query (e.g., 'paracetamol', 'headache', 'fever')."
              }
            },
            required: ["query"]
          }
        }]
      }]
    });

    // Format history for Gemini (excluding the final message we are sending now)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    let responseText = "";

    try {
      // Send the latest message
      let result = await chat.sendMessage(lastUserMessage.content);
      
      const functionCalls = result.response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === "search_medicines") {
          const query = call.args.query;

          const medicines = await prisma.medicine.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
                { company: { contains: query, mode: "insensitive" } }
              ],
            },
            select: {
              name: true,
              company: true,
              category: true,
              sellingPrice: true,
              stock: true,
              status: true,
            },
            take: 10,
          });

          // Send the database result back to Gemini
          result = await chat.sendMessage([{
            functionResponse: {
              name: "search_medicines",
              response: { result: medicines.length > 0 ? medicines : "No medicines found for this query." }
            }
          }]);
        }
      }

      try {
        responseText = result.response.text();
      } catch (e) {
        console.warn("Could not extract text from response:", e);
      }

      if (!responseText || responseText.trim() === "") {
        responseText = "আমি দুঃখিত, আপনার এই সমস্যার জন্য কোনো সুনির্দিষ্ট ওষুধ আমার ডাটাবেসে পাইনি। অনুগ্রহ করে ডাক্তারের পরামর্শ নিন অথবা অন্য কোনো ওষুধ খুঁজুন।";
      }
    } catch (e) {
      console.error("Gemini generation error:", e);
      throw new Error("Failed to generate AI response: " + e.message);
    }

    // Save assistant response to DB
    if (responseText) {
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "assistant",
          content: responseText,
        },
      });

      // Update session title if it's still "New Chat" and this is the first exchange
      if (session.title === "New Chat" && messages.length === 1) {
         try {
           const titleModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
           const titleSummary = await titleModel.generateContent(`Summarize the following message in 3 to 5 words to use as a chat title. Do not use quotes.\nMessage: ${lastUserMessage.content}`);
           const newTitle = titleSummary.response.text().trim().replace(/["']/g, "");
           await prisma.chatSession.update({
             where: { id: session.id },
             data: { title: newTitle }
           });
         } catch (e) {
           console.error("Title generation failed:", e);
         }
      }
    }

    return NextResponse.json({
      role: "assistant",
      content: responseText,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
