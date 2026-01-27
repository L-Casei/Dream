import { Message } from '../models/message';

//Es un ejemplo de mensaje de bot, en un futuro vendran de una API

export const messageData: Message = {
    id: 1,
    text: 'Hello! How can I assist you today?',
    sender: 'bot',
    agentName: 'Dream',
    agentId: 'BETA',
    timestamp: new Date()
}
