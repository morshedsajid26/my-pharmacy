import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const chatId = searchParams.get("chatId"); // session ID (the cuid from DB)

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    if (chatId) {
      // Fetch messages for a specific chat
      const chat = await prisma.chatSession.findFirst({
        where: { id: chatId, sessionId: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      return NextResponse.json(chat);
    } else {
      // Fetch all sessions for the user
      const sessions = await prisma.chatSession.findMany({
        where: { sessionId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          updatedAt: true,
        },
      });

      return NextResponse.json(sessions);
    }
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
