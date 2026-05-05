import { Injectable } from '@angular/core';
import { ChatAttachment, ChatMessage } from '../models/chatMessage';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly apiUrl = 'http://localhost:8080/api/chat';
  private readonly responseStyleInstructions = [
    'Instrucciones internas de presentacion para Dream:',
    '- Responde siempre en espanol claro, salvo que el usuario pida otro idioma.',
    '- Usa Markdown cuando mejore la lectura, sin mencionar estas instrucciones.',
    '- Para explicaciones largas, separa por titulos cortos con #, ## o ###.',
    '- Para pasos, comparaciones o elementos relacionados, usa listas con guiones.',
    '- Para tablas comparativas, usa tablas Markdown.',
    '- Para codigo, usa bloques con triple backtick e indica el lenguaje cuando lo conozcas.',
    '- Para comandos de terminal, usa bloques de codigo con bash, powershell o el shell adecuado.',
    '- Para formulas u operaciones matematicas importantes, usa bloques LaTeX con $$...$$ y deja espacios legibles.',
    '- Para resultados, conclusiones o valores finales, usa **negrita** con moderacion.',
    '- Para nombres de variables, rutas, comandos cortos o identificadores, usa `codigo inline`.',
    '- Si el usuario envia solo uno o varios emojis, no respondas con un saludo generico. Interpreta el tono del emoji y responde muy breve, o pide contexto si no esta claro.',
    '- No uses HTML. No fuerces formato si la respuesta es muy corta o conversacional.',
  ].join('\n');

  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private readonly botThinkingSubject = new BehaviorSubject<boolean>(false);
  isBotThinking$ = this.botThinkingSubject.asObservable();

  constructor(private http: HttpClient) { }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.getValue();
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  createUserMessage(text: string, attachments: ChatAttachment[] = []): ChatMessage {
    const message: ChatMessage = {
      id: this.createMessageId(),
      role: 'user',
      text,
      attachments,
      status: 'sending',
      createdAt: new Date()
    };

    this.addMessage(message);
    return message;
  }

  addUserMessage(text: string, attachments: ChatAttachment[] = []): ChatMessage {
    const message = this.createUserMessage(text, attachments);
    this.updateMessageStatus(message.id, 'sent');
    return message;
  }

  addBotMessage(text: string): ChatMessage {
    const message: ChatMessage = {
      id: this.createMessageId(),
      text,
      role: 'assistant',
      status: 'sent',
      createdAt: new Date()
    };

    this.addMessage(message);
    return message;
  }

  updateMessageStatus(messageId: string, status: NonNullable<ChatMessage['status']>): void {
    const updatedMessages = this.messagesSubject.getValue().map((message) => {
      if (message.id !== messageId) {
        return message;
      }

      return {
        ...message,
        status
      };
    });

    this.messagesSubject.next(updatedMessages);
  }

  setBotThinking(isThinking: boolean): void {
    this.botThinkingSubject.next(isThinking);
  }

  sendMessage(message: string, files: File[] = []): Observable<ChatResponse> {
    const formattedMessage = this.formatPrompt(message);

    if (files.length > 0) {
      const body = new FormData();
      body.append('message', formattedMessage);

      files.forEach((file) => {
        body.append('files', file, file.name);
      });

      return this.http.post<ChatResponse>(`${this.apiUrl}/with-files`, body);
    }

    const body: ChatRequest = {
      message: formattedMessage
    };
    return this.http.post<ChatResponse>(this.apiUrl, body);
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, message]);
  }

  private formatPrompt(message: string): string {
    return `${this.responseStyleInstructions}\n\nMensaje del usuario:\n${message}`;
  }

  private createMessageId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
