import { Component, OnInit, inject } from '@angular/core'
import { CommonModule, AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { AsideComponent } from '../aside/aside.component';
import { ThemeService } from '../../services/theme.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-container',
  imports: [MessageListComponent, ChatInputComponent, AsideComponent, CommonModule, AsyncPipe],
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.css',
})
export class ChatContainerComponent implements OnInit {
  themeService = inject(ThemeService);
  private readonly chatService = inject(ChatService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  isDarkMode$ = this.themeService.isDarkMode$;
  isAsideCollapsed = false;

  ngOnInit(): void {
    const initialMessage = this.route.snapshot.queryParamMap.get('message')?.trim();

    if (!initialMessage) {
      return;
    }

    this.chatService.clearMessages();
    const userMessage = this.chatService.createUserMessage(initialMessage);
    this.chatService.setBotThinking(true);

    this.chatService.sendMessage(initialMessage).subscribe({
      next: (response) => {
        this.chatService.updateMessageStatus(userMessage.id, 'sent');
        this.chatService.setBotThinking(false);
        this.chatService.addBotMessage(response.answer);
      },
      error: (error) => {
        console.error('Error al enviar mensaje inicial:', error);
        this.chatService.updateMessageStatus(userMessage.id, 'error');
        this.chatService.setBotThinking(false);
        this.chatService.addBotMessage('Ha ocurrido un error al contactar con la IA.');
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }
  
  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public toggleAside(): void {
    this.isAsideCollapsed = !this.isAsideCollapsed;
  }
}
