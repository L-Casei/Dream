import { Injectable } from '@angular/core';
import { chatMessage } from '../models/chatMessage';
import { messageData } from '../data/message.data';
import { HttpClient } from '@angular/common/http';

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

  
  private messages: chatMessage[] = [messageData];

   constructor(private http: HttpClient) {}
}
