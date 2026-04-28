import { Injectable } from '@angular/core';
import { ChatMessage } from '../models/chatMessage';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

/* Tengo un servicio de Angular. En el constructor recibo HttpClient, que me permite hablar con el backend. 
Luego tengo una función sendMessage, que recibe un texto del usuario (ChatRequest), 
construye un objeto con ese mensaje y lo prepara para enviarlo al backend. 
La respuesta que espero recibir será un Observable con forma de ChatResponse. */

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

  //Direccion de la API
  private readonly apiUrl = 'http://localhost:8080/api/chat';

  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private readonly botThinkingSubject = new BehaviorSubject<boolean>(false);
  isBotThinking$ = this.botThinkingSubject.asObservable();

  constructor(private http: HttpClient) { }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.getValue();
  }

  addUserMessage(content: string): void {
    this.addMessage({
      id: Date.now(),
      content,
      role: 'user',
      timestamp: new Date()
    });
  }

  addBotMessage(content: string): void {
    this.addMessage({
      id: Date.now(),
      content,
      role: 'bot',
      agentName: 'Dream',
      agentId: 'BETA',
      timestamp: new Date()
    });
  }

  setBotThinking(isThinking: boolean): void {
    this.botThinkingSubject.next(isThinking);
  }

  sendMessage(message: string): Observable<ChatResponse> {
    const body: ChatRequest = {
      message: message
    };

    return this.http.post<ChatResponse>(this.apiUrl, body);
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, message]);
  }
}
