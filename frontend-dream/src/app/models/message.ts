export interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    agentName: string; //Es la marca
    agentId: string; //Es la version del agente que responde
    timestamp: Date;
}
