import { TranslatePipe } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'osf-files-drop-zone',
  imports: [TranslatePipe],
  templateUrl: './files-drop-zone.component.html',
  styleUrl: './files-drop-zone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesDropZoneComponent {
  enabled = input<boolean>(true);
  filesDropped = output<File[]>();
  isDragOver = signal(false);

  private dragDepth = 0;

  onDragEnter(event: DragEvent): void {
    if (!this.enabled()) {
      return;
    }

    if (event.dataTransfer?.types?.includes('Files')) {
      this.dragDepth += 1;
      this.isDragOver.set(true);
    }
  }

  onDragOver(event: DragEvent): void {
    if (!this.enabled()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isDragOver.set(true);
  }

  onDragLeave(event: Event): void {
    if (!this.enabled()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) {
      this.isDragOver.set(false);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragDepth = 0;
    this.isDragOver.set(false);

    if (!this.enabled()) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    this.filesDropped.emit(Array.from(files));
  }
}
