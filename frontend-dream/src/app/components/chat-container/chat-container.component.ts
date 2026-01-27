import { Component } from '@angular/core'
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';

@Component({
  selector: 'app-chat-container',
  imports: [MessageListComponent, ChatInputComponent],
  templateUrl: './chat-container.component.html',
})
export class ChatContainerComponent {

}
