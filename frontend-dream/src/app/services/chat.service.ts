import { Injectable } from '@angular/core';
import { Message } from '../models/message';
import { messageData } from '../data/message.data';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private messages: Message[] = [messageData];

  constructor() { }
}
