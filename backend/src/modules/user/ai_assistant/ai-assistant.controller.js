import * as aiService from './ai-assistant.service.js';

export const chatWithAI = async (req, res) => {
  try {
    const { messages, sessionId } = req.body;
    if (!messages || !sessionId) {
      return res.status(400).json({ success: false, message: 'Missing messages or sessionId' });
    }

    const message = await aiService.chatWithAIService({
      messages,
      sessionId,
      user: req.user,
    });

    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Chat service error' });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { sessionId, chatId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Missing sessionId parameter' });
    }

    const data = await aiService.getChatHistoryService(sessionId, chatId);
    if (chatId && !data) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
