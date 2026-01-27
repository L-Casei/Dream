import { Component, inject } from '@angular/core'
import { CommonModule, AsyncPipe } from '@angular/common';
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-chat-container',
  imports: [MessageListComponent, ChatInputComponent, SidebarComponent, CommonModule, AsyncPipe],
  templateUrl: './chat-container.component.html',
})
export class ChatContainerComponent {
  themeService = inject(ThemeService);
  isDarkMode$ = this.themeService.isDarkMode$;
  
  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
