export interface ChatAttachment {
    id?: string;
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
    url?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    text?: string;
    attachments?: ChatAttachment[];
    status?: 'sending' | 'sent' | 'error';
    createdAt: Date;
}
