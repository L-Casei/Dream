import { ChatMessage } from '../models/chatMessage';

// Mensaje de ejemplo para pruebas locales.
export const messageData: ChatMessage = {
    id: 'demo-message',
    text: 'Hello! How can I assist you today?',
    role: 'assistant',
    status: 'sent',
    createdAt: new Date()
};
