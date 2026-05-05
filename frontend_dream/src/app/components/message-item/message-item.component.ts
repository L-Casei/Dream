import { Component, Input, OnChanges } from '@angular/core';
import { ChatAttachment, ChatMessage } from '../../models/chatMessage';

type InlineToken = {
  type: 'text' | 'code' | 'strong' | 'link';
  text: string;
  href?: string;
};

type MessageBlock =
  | { type: 'paragraph'; tokens: InlineToken[] }
  | { type: 'heading'; tokens: InlineToken[] }
  | { type: 'list'; items: InlineToken[][] }
  | { type: 'code'; language: string; content: string }
  | { type: 'math'; content: string }
  | { type: 'table'; headers: InlineToken[][]; rows: InlineToken[][][] };

@Component({
  selector: 'app-message-item',
  imports: [],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.css',
})
export class MessageItemComponent implements OnChanges {
  @Input() message!: ChatMessage;

  blocks: MessageBlock[] = [];

  ngOnChanges(): void {
    this.blocks = this.parseMessage(this.message?.text ?? '');
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

  getStatusText(): string {
    switch (this.message.status) {
      case 'sending':
        return 'Enviando';
      case 'error':
        return 'Error';
      case 'sent':
        return 'Enviado';
      default:
        return '';
    }
  }

  private parseMessage(content: string): MessageBlock[] {
    const normalizedContent = content.replace(/\r\n?/g, '\n');
    const lines = normalizedContent.split('\n');
    const blocks: MessageBlock[] = [];
    let paragraph: string[] = [];
    let index = 0;

    const flushParagraph = (): void => {
      const text = paragraph.join('\n').trim();
      if (text) {
        blocks.push({ type: 'paragraph', tokens: this.parseInline(text) });
      }
      paragraph = [];
    };

    while (index < lines.length) {
      const line = lines[index];
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        flushParagraph();
        index++;
        continue;
      }

      if (trimmedLine.startsWith('```')) {
        flushParagraph();
        const language = trimmedLine.slice(3).trim();
        const codeLines: string[] = [];
        index++;

        while (index < lines.length && !lines[index].trim().startsWith('```')) {
          codeLines.push(lines[index]);
          index++;
        }

        blocks.push({
          type: 'code',
          language,
          content: codeLines.join('\n'),
        });

        index += index < lines.length ? 1 : 0;
        continue;
      }

      if (trimmedLine.startsWith('$$')) {
        flushParagraph();
        const mathLines: string[] = [];
        const firstLine = trimmedLine.slice(2).trim();
        let closed = false;

        if (firstLine.endsWith('$$') && firstLine.length > 2) {
          mathLines.push(firstLine.slice(0, -2).trim());
          closed = true;
        } else if (firstLine) {
          mathLines.push(firstLine);
        }

        index++;

        while (!closed && index < lines.length) {
          const mathLine = lines[index].trim();

          if (mathLine.endsWith('$$')) {
            mathLines.push(mathLine.slice(0, -2).trim());
            closed = true;
          } else {
            mathLines.push(lines[index]);
          }

          index++;
        }

        blocks.push({
          type: 'math',
          content: mathLines.join('\n').trim(),
        });
        continue;
      }

      const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        blocks.push({ type: 'heading', tokens: this.parseInline(headingMatch[2]) });
        index++;
        continue;
      }

      if (this.isTableStart(lines, index)) {
        flushParagraph();
        const headers = this.splitTableRow(lines[index]).map((cell) => this.parseInline(cell));
        index += 2;
        const rows: InlineToken[][][] = [];

        while (index < lines.length && this.isTableRow(lines[index])) {
          rows.push(this.splitTableRow(lines[index]).map((cell) => this.parseInline(cell)));
          index++;
        }

        blocks.push({ type: 'table', headers, rows });
        continue;
      }

      if (/^[-*]\s+/.test(trimmedLine)) {
        flushParagraph();
        const items: InlineToken[][] = [];

        while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
          items.push(this.parseInline(lines[index].trim().replace(/^[-*]\s+/, '')));
          index++;
        }

        blocks.push({ type: 'list', items });
        continue;
      }

      paragraph.push(line);
      index++;
    }

    flushParagraph();
    return blocks;
  }

  private parseInline(text: string): InlineToken[] {
    const tokens: InlineToken[] = [];
    const inlinePattern = /(\[[^\]]+\]\((https?:\/\/[^)\s]+)\)|`[^`]+`|\*\*[^*]+\*\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = inlinePattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', text: text.slice(lastIndex, match.index) });
      }

      const value = match[0];
      if (value.startsWith('`')) {
        tokens.push({ type: 'code', text: value.slice(1, -1) });
      } else if (value.startsWith('**')) {
        tokens.push({ type: 'strong', text: value.slice(2, -2) });
      } else {
        const labelEnd = value.indexOf('](');
        tokens.push({
          type: 'link',
          text: value.slice(1, labelEnd),
          href: value.slice(labelEnd + 2, -1)
        });
      }

      lastIndex = match.index + value.length;
    }

    if (lastIndex < text.length) {
      tokens.push({ type: 'text', text: text.slice(lastIndex) });
    }

    return tokens;
  }

  private isTableStart(lines: string[], index: number): boolean {
    return this.isTableRow(lines[index]) && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1]);
  }

  private isTableRow(line: string): boolean {
    return line.includes('|') && line.trim().split('|').filter(Boolean).length >= 2;
  }

  private splitTableRow(line: string): string[] {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  }
}
