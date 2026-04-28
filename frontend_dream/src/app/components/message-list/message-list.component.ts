import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { MessageItemComponent } from '../message-item/message-item.component';
import { ChatMessage } from '../../models/chatMessage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [AsyncPipe, MessageItemComponent],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css'
})
export class MessageListComponent {

  messages$: Observable<ChatMessage[]>;
  isBotThinking$: Observable<boolean>;

  constructor(private chatService: ChatService) {
    this.messages$ = this.chatService.messages$;
    this.isBotThinking$ = this.chatService.isBotThinking$;

  }

}
