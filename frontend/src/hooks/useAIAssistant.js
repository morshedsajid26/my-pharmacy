import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useAIAssistant() {
  const chatMutation = useMutation({
    mutationFn: async ({ messages, sessionId }) => {
      const res = await api.post("/user/ai-assistant", { messages, sessionId });
      return res?.message !== undefined ? res.message : (res?.data || res);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to communicate with AI");
    },
  });

  const loadHistory = async (sessionId) => {
    try {
      const res = await api.get("/user/ai-assistant/history", {
        params: { sessionId },
      });
      const data = res?.data !== undefined ? res.data : res;
      if (Array.isArray(data) && data.length > 0) {
        const latestChatId = data[0].id;
        const chatRes = await api.get("/user/ai-assistant/history", {
          params: { sessionId, chatId: latestChatId },
        });
        const chatData = chatRes?.data !== undefined ? chatRes.data : chatRes;
        if (chatData?.messages) {
          return chatData.messages.map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          }));
        }
      }
    } catch (error) {
      console.warn("Could not load backend AI chat history:", error.message);
    }
    return null;
  };

  return {
    sendMessage: chatMutation.mutateAsync,
    isSending: chatMutation.isPending,
    loadHistory,
  };
}
