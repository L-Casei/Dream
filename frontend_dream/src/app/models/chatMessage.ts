export interface ChatAttachment {
    id: string;
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
}

export interface ChatMessage {
    id: number;
    content: string;
    role: 'user' | 'bot';
    agentName?: string; //Es la marca
    agentId?: string; //Es la version del agente que responde
    attachments?: ChatAttachment[];
    timestamp: Date;
}
