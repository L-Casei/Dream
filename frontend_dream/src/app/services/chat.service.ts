import { Injectable } from '@angular/core';
import { ChatAttachment, ChatMessage } from '../models/chatMessage';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, forkJoin, map, of, tap } from 'rxjs';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  plan?: string;
  avatarUrl?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  preview?: string;
  updatedAt: Date;
  unreadCount?: number;
}

interface ChatConversationResponse extends Omit<ChatConversation, 'updatedAt'> {
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly apiBaseUrl = 'http://localhost:8080/api';
  private readonly chatApiUrl = `${this.apiBaseUrl}/chat`;
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

  private readonly currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private readonly conversationsSubject = new BehaviorSubject<ChatConversation[]>([]);
  conversations$ = this.conversationsSubject.asObservable();

  private readonly selectedConversationIdSubject = new BehaviorSubject<string | null>(null);
  selectedConversationId$ = this.selectedConversationIdSubject.asObservable();

  private readonly sidebarLoadingSubject = new BehaviorSubject<boolean>(false);
  isSidebarLoading$ = this.sidebarLoadingSubject.asObservable();

  private readonly sidebarErrorSubject = new BehaviorSubject<string | null>(null);
  sidebarError$ = this.sidebarErrorSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadSidebarData(): void {
    this.sidebarLoadingSubject.next(true);
    this.sidebarErrorSubject.next(null);

    forkJoin({
      user: this.loadCurrentUser(),
      conversations: this.loadConversations()
    }).pipe(
      finalize(() => this.sidebarLoadingSubject.next(false))
    ).subscribe({
      error: (error) => {
        console.error('Error al cargar la barra lateral:', error);
        this.sidebarErrorSubject.next('No se pudo cargar tu informacion.');
      }
    });
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.getValue();
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  startNewConversation(): void {
    this.selectedConversationIdSubject.next(null);
    this.clearMessages();
  }

  selectConversation(conversationId: string): void {
    this.selectedConversationIdSubject.next(conversationId);
    this.setBotThinking(true);

    this.http.get<ChatMessage[]>(`${this.chatApiUrl}/conversations/${conversationId}/messages`).pipe(
      map((messages) => messages.map((message) => ({
        ...message,
        createdAt: new Date(message.createdAt)
      }))),
      finalize(() => this.setBotThinking(false))
    ).subscribe({
      next: (messages) => this.messagesSubject.next(messages),
      error: (error) => {
        console.error('Error al cargar la conversacion:', error);
        this.addBotMessage('No he podido cargar esta conversacion. Intentalo de nuevo en unos segundos.');
      }
    });
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

      return this.http.post<ChatResponse>(`${this.chatApiUrl}/with-files`, body);
    }

    const body: ChatRequest = {
      message: formattedMessage
    };
    return this.http.post<ChatResponse>(this.chatApiUrl, body);
  }

  private loadCurrentUser(): Observable<CurrentUser | null> {
    return this.http.get<CurrentUser>(`${this.apiBaseUrl}/users/me`).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        console.warn('Backend de usuario no disponible todavia:', error);
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  private loadConversations(): Observable<ChatConversation[]> {
    return this.http.get<ChatConversationResponse[]>(`${this.chatApiUrl}/conversations`).pipe(
      map((conversations) => conversations.map((conversation) => ({
        ...conversation,
        updatedAt: new Date(conversation.updatedAt)
      }))),
      tap((conversations) => this.conversationsSubject.next(conversations)),
      catchError((error) => {
        console.warn('Backend de conversaciones no disponible todavia:', error);
        this.conversationsSubject.next([]);
        return of([]);
      })
    );
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
