import {
  ChatBodyType,
  ChatbotQueryType,
  ChatStoryAllGuestsListResType,
  ChatStoryListResType,
} from "@/schemaValidations/chatbot.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const ChatbotApiRequests = {
  sendMessage: async (body: ChatBodyType) => {
    return http.post("/chatbot/chat", body);
  },

  messages: () => {
    return http.get<ChatStoryListResType>("/chatbot/messages");
  },

  list: (params: ChatbotQueryType) => {
    return http.get<ChatStoryAllGuestsListResType>("/chatbot/list-message?" + queryString.stringify(params));
  },
};
