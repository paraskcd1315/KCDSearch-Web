import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    if (!value?.trim()) return this.sanitizer.bypassSecurityTrustHtml('');
    const html = (marked.parse as (s: string) => string)(value.trim());
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
