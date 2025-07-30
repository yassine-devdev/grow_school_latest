
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export const useConciergeAI = () => {
  const chatRef = useRef<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([
      // Initial message is now set by the chat history initialization
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
        setIsLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: "You are Aura Concierge, a personal AI assistant. Be helpful, friendly, and slightly futuristic. Your goal is to assist users in managing their tasks and information within this application. Keep your responses concise and clear."
            });

            const newChat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: 'Hello' }] },
                    { role: 'model', parts: [{ text: 'Hello! I am Aura Concierge, your personal AI assistant. How can I help you today?' }] }
                ]
            });
            chatRef.current = newChat;
            // Set initial message from history
            setMessages([{ role: 'model', text: 'Hello! I am Aura Concierge, your personal AI assistant. How can I help you today?' }]);
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            console.error("Failed to initialize chat", e);
            setError(new Error(errorMessage));
            setMessages([{role: 'model', text: 'Sorry, I couldn\'t connect to the AI service. Please check your configuration.'}]);
        } finally {
            setIsLoading(false);
        }
    }
    initializeChat();
  }, []);

  const sendMessage = useCallback(async (prompt: string) => {
    const chat = chatRef.current;
    if (!prompt || isLoading || !chat) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = { role: 'user', text: prompt };
    // Add user message and a placeholder for model's response
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);

    try {
      const result = await chat.sendMessageStream(prompt);

      for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
              lastMessage.text += chunkText;
            }
            return newMessages;
          });
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(new Error(errorMessage));
       setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'model' && lastMessage.text === '') {
              lastMessage.text = 'Sorry, I encountered an error. Please try again.';
              return newMessages;
            }
            return prev;
        });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return { messages, isLoading, error, sendMessage };
};
