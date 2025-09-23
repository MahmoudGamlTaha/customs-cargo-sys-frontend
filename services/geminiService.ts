
import { GoogleGenAI, Chat } from "@google/genai";
import { Language } from '../contexts/LanguageContext';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI Chatbot will not function.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

let chat: Chat | null = null;
let currentChatLanguage: Language | null = null;

const instructions = {
  ar: 'أنت مساعد مفيد لمصلحة الجمارك الليبية. أجب على الأسئلة بإيجاز واحترافية باللغة العربية. يمكنك إرشاد المستخدمين حول العضوية وخدمات المستندات والفعاليات وميزات المنصة الأخرى.',
  en: 'You are a helpful assistant for the Libyan Union of Chambers of Commerce. Answer questions concisely and professionally in English. You can guide users on membership, document services, events, and other platform features.',
};

export const startOrUpdateChat = (language: Language) => {
  if (!ai) return;
  // Create a new chat session only if the language changes
  if (language !== currentChatLanguage) {
      chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: instructions[language],
        },
      });
      currentChatLanguage = language;
  }
};

export const sendMessageToAI = async (
  message: string,
  onChunk: (chunk: string) => void,
  language: Language
): Promise<void> => {
  if (!ai) {
    const errorMessage = language === 'ar' 
      ? "عذراً، خدمة المساعد الذكي غير متاحة حالياً بسبب مشكلة في الإعدادات."
      : "Sorry, the AI assistant is currently unavailable due to a configuration issue.";
    onChunk(errorMessage);
    return;
  }
  
  // Ensure chat is initialized with the correct language
  startOrUpdateChat(language);

  if (!chat) {
     const errorMessage = language === 'ar'
        ? "عذراً، لم نتمكن من بدء محادثة مع المساعد الذكي."
        : "Sorry, we could not start a session with the AI assistant.";
     onChunk(errorMessage);
     return;
  }

  try {
    const responseStream = await chat.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Error sending message to AI:", error);
    const errorMessage = language === 'ar'
        ? "عذراً، حدث خطأ أثناء التواصل مع المساعد الذكي. يرجى المحاولة مرة أخرى."
        : "Sorry, an error occurred while communicating with the AI assistant. Please try again.";
    onChunk(errorMessage);
  }
};

export const translateNameToEnglish = async (name: string): Promise<string> => {
    if (!ai) {
        console.warn("AI service not initialized. Cannot translate name.");
        return name; // Fallback to original name
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following Arabic name to English for an official business document: "${name}". Return only the translated name itself, without any introductory text or quotation marks.`,
        });

        const translatedName = response.text.trim();
        if (translatedName) {
            return translatedName;
        } else {
            console.warn("Translation returned an empty response. Falling back to original name.");
            return name;
        }
    } catch (error) {
        console.error("Error translating name to English with AI:", error);
        return name; // Fallback to original name on error
    }
};

export const translateNameToArabic = async (name: string): Promise<string> => {
    if (!ai) {
        console.warn("AI service not initialized. Cannot translate name.");
        return name;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following English name to Arabic for an official business document: "${name}". Return only the translated name itself, without any introductory text or quotation marks.`,
        });

        const translatedName = response.text.trim();
        if (translatedName) {
            return translatedName;
        } else {
            console.warn("Translation returned an empty response. Falling back to original name.");
            return name;
        }
    } catch (error) {
        console.error("Error translating name to Arabic with AI:", error);
        return name; // Fallback to original name on error
    }
};
