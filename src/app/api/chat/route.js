import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
1. Identify the specific health problem the user is facing, and suggest the CORRECT and APPROPRIATE popular **Brand Name medicine produced by top Bangladeshi Pharmaceutical Companies (e.g., Square, Beximco, Incepta, Renata, Eskayef, Opsonin)** for that EXACT problem.
2. CRITICAL: DO NOT suggest the same medicine for every problem. You must match the symptom to the correct medicine (e.g., Fever -> Napa/Ace; Allergy -> Fexo/Alatrol/Deslor; Gastric -> Seclo/Maxpro/Sergel/Finix; Cough -> Adovas/Tuska; Pain -> Rolac/Tory). Include its generic name in brackets.
3. EXTREMELY IMPORTANT: DO NOT suggest foreign medicine brands (like Tylenol, Advil, Zantac). ALWAYS prioritize and exclusively use local Bangladeshi Brand Names.
4. After suggesting, use the search_medicines tool to check if those specific **Brand Names** are available in our database. Since our database does not contain generic names, you MUST search using  Brand Names.
5. Even if the search_medicines tool returns 'No medicines found', you MUST still explicitly tell the user the Brand Name (with Generic Name) of the medicine you suggest and its general usage. Then, mention that it is currently unavailable in our pharmacy.
6. NEVER give definitive medical diagnoses. Always advise them to consult a registered doctor for serious or persistent issues.
7. NEVER prescribe prescription drugs without warning.
8. When listing medicines, you MUST return: Brand Name (Generic Name), Price (if available), Available Stock (if available), and Usage Information.
9. Be concise, polite, and helpful. Reply in natural, polite Bengali (বাংলা). You can keep medicine brand names in English.
10. If a user asks for medicines using colloquial terms (e.g., 'gas', 'fever', 'matha betha'), FIRST state your CORRECT medicine suggestion using popular Bangladesh brand names. THEN use those **Brand Names** as the query in the search_medicines tool. DO NOT search using generic names.`;

    const tools = [{
      type: "function",
      function: {
        name: "search_medicines",
        description: "Search the pharmacy inventory for medicines by keyword (e.g., name, category, generic name, or symptom).",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query (e.g., 'paracetamol', 'headache', 'fever')."
            }
          },
          required: ["query"]
        }
      }
    }];

    // Format history for OpenAI
    const history = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    // Prepend system prompt
    history.unshift({ role: "system", content: systemPrompt });

    let responseText = "";

    try {
      let response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: history,
        tools: tools,
        tool_choice: "auto",
      });

      let message = response.choices[0].message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        // Add assistant message with tool calls
        history.push(message);

        for (const toolCall of message.tool_calls) {
          if (toolCall.function.name === "search_medicines") {
            let query = "";
            try {
              const args = JSON.parse(toolCall.function.arguments);
              query = args.query || "";
            } catch (e) {
              console.warn("Failed to parse tool arguments", e);
            }

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
            
            // Add tool response
            history.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify(medicines.length > 0 ? medicines : { result: "No medicines found for this query." })
            });
          } else {
            // Handle unexpected tools
            history.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({ error: "Unknown function" })
            });
          }
        }

        // Second call to get final response
        response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: history,
        });

        message = response.choices[0].message;
      }

      responseText = message.content;

      if (!responseText || responseText.trim() === "") {
        responseText = "আমি দুঃখিত, আপনার এই সমস্যার জন্য কোনো সুনির্দিষ্ট ওষুধ আমার ডাটাবেসে পাইনি। অনুগ্রহ করে ডাক্তারের পরামর্শ নিন অথবা অন্য কোনো ওষুধ খুঁজুন।";
      }
    } catch (e) {
      console.error("OpenAI generation error:", e);
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
           const titleResponse = await openai.chat.completions.create({
             model: "gpt-4o-mini",
             messages: [{ role: "user", content: `Summarize the following message in 3 to 5 words to use as a chat title. Do not use quotes.\nMessage: ${lastUserMessage.content}` }]
           });
           const newTitle = titleResponse.choices[0].message.content.trim().replace(/["']/g, "");
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
