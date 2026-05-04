import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatAttachment } from '../../models/chatMessage';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.css',
})
export class ChatInputComponent {

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  userMessage = '';
  isLoading = false;
  isDraggingFile = false;
  attachedFiles: File[] = [];
  attachedFileViews: ChatAttachment[] = [];

  constructor(private chatService: ChatService) {}

  @HostListener('document:dragover', ['$event'])
  onDocumentDragOver(event: DragEvent): void {
    if (!this.hasFiles(event)) {
      return;
    }

    event.preventDefault();
    this.isDraggingFile = true;
  }

  @HostListener('document:dragleave', ['$event'])
  onDocumentDragLeave(event: DragEvent): void {
    if (event.clientX <= 0 || event.clientY <= 0) {
      this.isDraggingFile = false;
    }
  }

  @HostListener('document:drop', ['$event'])
  onDocumentDrop(event: DragEvent): void {
    if (!this.hasFiles(event)) {
      return;
    }

    event.preventDefault();
    this.isDraggingFile = false;
    this.addFiles(event.dataTransfer?.files);
  }

  openFilePicker(): void {
    if (this.isLoading) {
      return;
    }

    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  removeFile(fileId: string): void {
    const fileView = this.attachedFileViews.find((file) => file.id === fileId);

    if (fileView?.previewUrl) {
      URL.revokeObjectURL(fileView.previewUrl);
    }

    this.attachedFiles = this.attachedFiles.filter((file) => this.createFileId(file) !== fileId);
    this.attachedFileViews = this.attachedFileViews.filter((file) => file.id !== fileId);
  }

  sendMessage(): void {
    const text = this.userMessage.trim();
    const files = [...this.attachedFiles];
    const attachments = this.attachedFileViews.map((file) => ({ ...file }));

    if ((!text && files.length === 0) || this.isLoading) {
      return;
    }

    this.chatService.addUserMessage(text, attachments);

    this.userMessage = '';
    this.clearAttachedFiles(false);
    this.isLoading = true;
    this.chatService.setBotThinking(true);

    this.chatService.sendMessage(text, files).subscribe({
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

  formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  isImage(file: ChatAttachment): boolean {
    return file.type.startsWith('image/');
  }

  private addFiles(fileList?: FileList | null): void {
    if (!fileList || fileList.length === 0) {
      return;
    }

    Array.from(fileList).forEach((file) => {
      const id = this.createFileId(file);

      if (this.attachedFileViews.some((attachedFile) => attachedFile.id === id)) {
        return;
      }

      this.attachedFiles.push(file);
      this.attachedFileViews.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      });
    });
  }

  private clearAttachedFiles(revokeUrls: boolean): void {
    if (revokeUrls) {
      this.attachedFileViews.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    }

    this.attachedFiles = [];
    this.attachedFileViews = [];
  }

  private createFileId(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  private hasFiles(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }
}
