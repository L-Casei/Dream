import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../models/chatMessage';

@Component({
  selector: 'app-message-item',
  imports: [],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.css',
})

export class MessageItemComponent {
  @Input() message!: ChatMessage;
}
