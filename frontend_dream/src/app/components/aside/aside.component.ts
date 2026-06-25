import { Component, Input, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe, isPlatformBrowser } from '@angular/common';
import { ChatConversation, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-aside',
  imports: [CommonModule, DatePipe, SlicePipe],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css',
})
export class AsideComponent implements OnInit {
  @Input() collapsed = false;

  private readonly chatService = inject(ChatService);
  private readonly platformId = inject(PLATFORM_ID);

  currentUser$ = this.chatService.currentUser$;
  conversations$ = this.chatService.conversations$;
  selectedConversationId$ = this.chatService.selectedConversationId$;
  isSidebarLoading$ = this.chatService.isSidebarLoading$;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.chatService.loadSidebarData();
  }

  selectConversation(conversation: ChatConversation): void {
    this.chatService.selectConversation(conversation.id);
  }

  startNewConversation(): void {
    this.chatService.startNewConversation();
  }

  trackConversation(_: number, conversation: ChatConversation): string {
    return conversation.id;
  }
}
