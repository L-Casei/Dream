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
  @ViewChild('messageInput') messageInput?: ElementRef<HTMLInputElement>;

  userMessage = '';
  isLoading = false;
  isDraggingFile = false;
  isEmojiPickerOpen = false;
  emojiSearch = '';
  attachmentError = '';
  attachedFiles: File[] = [];
  attachedFileViews: ChatAttachment[] = [];
  readonly maxFilesPerMessage = 5;
  readonly maxFileSizeBytes = 10 * 1024 * 1024;
  readonly maxTotalSizeBytes = 25 * 1024 * 1024;
  readonly allowedExtensions = new Set(['pdf', 'txt', 'md', 'csv', 'json', 'png', 'jpg', 'jpeg', 'webp']);
  readonly blockedExtensions = new Set(['exe', 'bat', 'cmd', 'sh', 'zip', 'rar', '7z', 'jar', 'class']);
  readonly emojiCategories = [
    {
      name: 'Caras',
      emojis: [
        '\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F601}', '\u{1F606}', '\u{1F605}', '\u{1F602}', '\u{1F923}',
        '\u{1F642}', '\u{1F643}', '\u{1FAE0}', '\u{1F609}', '\u{1F60A}', '\u{1F607}', '\u{1F970}', '\u{1F60D}',
        '\u{1F929}', '\u{1F618}', '\u{1F617}', '\u{1F61A}', '\u{1F619}', '\u{1F972}', '\u{1F60B}', '\u{1F61B}',
        '\u{1F61C}', '\u{1F92A}', '\u{1F61D}', '\u{1F911}', '\u{1F917}', '\u{1F92D}', '\u{1FAE2}', '\u{1FAE3}',
        '\u{1F914}', '\u{1FAE1}', '\u{1F910}', '\u{1F928}', '\u{1F610}', '\u{1F611}', '\u{1F636}', '\u{1FAE5}',
        '\u{1F60F}', '\u{1F612}', '\u{1F644}', '\u{1F62C}', '\u{1F62E}\u{200D}\u{1F4A8}', '\u{1F925}', '\u{1FAE8}', '\u{1F60C}',
        '\u{1F614}', '\u{1F62A}', '\u{1F924}', '\u{1F634}', '\u{1F637}', '\u{1F912}', '\u{1F915}', '\u{1F922}',
        '\u{1F92E}', '\u{1F927}', '\u{1F975}', '\u{1F976}', '\u{1F974}', '\u{1F635}', '\u{1F92F}', '\u{1F920}',
        '\u{1F973}', '\u{1F978}', '\u{1F60E}', '\u{1F913}', '\u{1F9D0}', '\u{1F615}', '\u{1FAE4}', '\u{1F61F}',
        '\u{1F641}', '\u{2639}\u{FE0F}', '\u{1F62E}', '\u{1F62F}', '\u{1F632}', '\u{1F633}', '\u{1F97A}', '\u{1F979}',
        '\u{1F626}', '\u{1F627}', '\u{1F628}', '\u{1F630}', '\u{1F625}', '\u{1F622}', '\u{1F62D}', '\u{1F631}',
        '\u{1F616}', '\u{1F623}', '\u{1F61E}', '\u{1F613}', '\u{1F629}', '\u{1F62B}', '\u{1F971}', '\u{1F624}',
        '\u{1F621}', '\u{1F620}', '\u{1F92C}', '\u{1F608}', '\u{1F47F}', '\u{1F480}', '\u{1F4A9}', '\u{1F921}'
      ]
    },
    {
      name: 'Gestos',
      emojis: [
        '\u{1F44B}', '\u{1F91A}', '\u{1F590}\u{FE0F}', '\u{270B}', '\u{1F596}', '\u{1FAF1}', '\u{1FAF2}', '\u{1FAF3}',
        '\u{1FAF4}', '\u{1F44C}', '\u{1F90C}', '\u{1F90F}', '\u{270C}\u{FE0F}', '\u{1F91E}', '\u{1FAF0}', '\u{1F91F}',
        '\u{1F918}', '\u{1F919}', '\u{1F448}', '\u{1F449}', '\u{1F446}', '\u{1F595}', '\u{1F447}', '\u{261D}\u{FE0F}',
        '\u{1FAF5}', '\u{1F44D}', '\u{1F44E}', '\u{270A}', '\u{1F44A}', '\u{1F91B}', '\u{1F91C}', '\u{1F44F}',
        '\u{1F64C}', '\u{1FAF6}', '\u{1F450}', '\u{1F932}', '\u{1F91D}', '\u{1F64F}', '\u{270D}\u{FE0F}', '\u{1F4AA}'
      ]
    },
    {
      name: 'Objetos',
      emojis: [
        '\u{1F4A1}', '\u{1F525}', '\u{2728}', '\u{1F31F}', '\u{1F4AF}', '\u{2705}', '\u{274C}', '\u{26A0}\u{FE0F}',
        '\u{1F4CC}', '\u{1F4CE}', '\u{1F4C4}', '\u{1F4C1}', '\u{1F4BE}', '\u{1F4BF}', '\u{1F4F7}', '\u{1F3A5}',
        '\u{1F4BB}', '\u{1F5A5}\u{FE0F}', '\u{2328}\u{FE0F}', '\u{1F5B1}\u{FE0F}', '\u{1F4F1}', '\u{1F4DE}', '\u{1F50B}', '\u{1FAAB}',
        '\u{231A}', '\u{23F0}', '\u{1F512}', '\u{1F513}', '\u{1F511}', '\u{1F528}', '\u{1F6E0}\u{FE0F}', '\u{1F9F0}'
      ]
    },
    {
      name: 'Simbolos',
      emojis: [
        '\u{2764}\u{FE0F}', '\u{1F9E1}', '\u{1F49B}', '\u{1F49A}', '\u{1F499}', '\u{1F49C}', '\u{1F90E}', '\u{1F5A4}',
        '\u{1F90D}', '\u{1F494}', '\u{2763}\u{FE0F}', '\u{1F495}', '\u{1F49E}', '\u{1F498}', '\u{1F4A5}', '\u{1F4AB}',
        '\u{1F4A6}', '\u{1F4A8}', '\u{1F4AC}', '\u{1F441}\u{FE0F}\u{200D}\u{1F5E8}\u{FE0F}', '\u{1F5E8}\u{FE0F}', '\u{1F44C}', '\u{1F195}', '\u{1F199}',
        '\u{2B50}', '\u{2757}', '\u{2753}', '\u{267B}\u{FE0F}', '\u{267E}\u{FE0F}', '\u{2699}\u{FE0F}', '\u{1F51D}', '\u{1F51C}'
      ]
    }
  ];

  constructor(private chatService: ChatService) {}

  get filteredEmojiCategories(): { name: string; emojis: string[] }[] {
    const search = this.emojiSearch.trim().toLowerCase();

    if (!search) {
      return this.emojiCategories;
    }

    return this.emojiCategories
      .map((category) => ({
        ...category,
        emojis: category.name.toLowerCase().includes(search) ? category.emojis : []
      }))
      .filter((category) => category.emojis.length > 0);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.emoji-picker-shell') && !target?.closest('.emoji-toggle')) {
      this.isEmojiPickerOpen = false;
    }
  }

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

  toggleEmojiPicker(event: MouseEvent): void {
    event.stopPropagation();

    if (this.isLoading) {
      return;
    }

    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  insertEmoji(emoji: string): void {
    const input = this.messageInput?.nativeElement;

    if (!input) {
      this.userMessage += emoji;
      return;
    }

    const start = input.selectionStart ?? this.userMessage.length;
    const end = input.selectionEnd ?? this.userMessage.length;
    this.userMessage = `${this.userMessage.slice(0, start)}${emoji}${this.userMessage.slice(end)}`;

    queueMicrotask(() => {
      input.focus();
      const cursorPosition = start + emoji.length;
      input.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  removeFile(fileId?: string): void {
    if (!fileId) {
      return;
    }

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

    const userMessage = this.chatService.createUserMessage(text, attachments);

    this.userMessage = '';
    this.clearAttachedFiles(false);
    this.attachmentError = '';
    this.isLoading = true;
    this.chatService.setBotThinking(true);

    this.chatService.sendMessage(text, files).subscribe({
      next: (response) => {
        this.chatService.updateMessageStatus(userMessage.id, 'sent');
        this.chatService.setBotThinking(false);
        this.chatService.addBotMessage(response.answer);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.chatService.updateMessageStatus(userMessage.id, 'error');
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

    this.attachmentError = '';

    for (const file of Array.from(fileList)) {
      const validationError = this.validateFile(file);

      if (validationError) {
        this.attachmentError = validationError;
        continue;
      }

      const id = this.createFileId(file);

      if (this.attachedFileViews.some((attachedFile) => attachedFile.id === id)) {
        continue;
      }

      this.attachedFiles.push(file);
      this.attachedFileViews.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      });
    }
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

  private validateFile(file: File): string | null {
    const extension = this.getFileExtension(file.name);

    if (this.attachedFiles.length >= this.maxFilesPerMessage) {
      return `Puedes adjuntar como maximo ${this.maxFilesPerMessage} archivos por mensaje.`;
    }

    if (this.blockedExtensions.has(extension) || !this.allowedExtensions.has(extension)) {
      return `Formato no permitido: ${file.name}`;
    }

    if (file.size > this.maxFileSizeBytes) {
      return `El archivo ${file.name} supera el limite de 10 MB.`;
    }

    const totalSize = this.attachedFiles.reduce((sum, attachedFile) => sum + attachedFile.size, 0) + file.size;

    if (totalSize > this.maxTotalSizeBytes) {
      return 'El mensaje supera el limite total de 25 MB en adjuntos.';
    }

    return null;
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() ?? '';
  }

  private hasFiles(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }
}
