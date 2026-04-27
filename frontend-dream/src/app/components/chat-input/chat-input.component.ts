import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.css',
})
export class ChatInputComponent {

  userMessage = '';
  isLoading = false;

  constructor(private chatService: ChatService) {}

  sendMessage(): void {
    const text = this.userMessage.trim();

    if (!text || this.isLoading) {
      return;
    }

    this.chatService.addUserMessage(text);

    this.userMessage = '';
    this.isLoading = true;
    this.chatService.setBotThinking(true);

    this.chatService.sendMessage(text).subscribe({
      next: (response) => {
        this.chatService.setBotThinking(false);
        this.chatService.addBotMessage(response.answer);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.chatService.setBotThinking(false);
        this.chatService.addBotMessage('Ha ocurrido un error al contactar con la IA.');
        this.isLoading = false;
      }
    });
  }
}
