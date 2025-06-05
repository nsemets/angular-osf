import { LMarkdownEditorModule, MdEditorOption } from 'ngx-markdown-editor';
import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { PanelModule } from 'primeng/panel';

import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'osf-edit-section',
  imports: [PanelModule, Button, TranslatePipe, FormsModule, LMarkdownEditorModule],
  templateUrl: './edit-section.component.html',
  styleUrl: './edit-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSectionComponent implements OnInit {
  initialContent = input.required<string>();
  content = '';
  contentChange = output<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstance: any;
  public options: MdEditorOption = {
    showPreviewPanel: true,
    resizable: true,
    customRender: {},
    fontAwesomeVersion: '6',
    markedjsOpt: {
      sanitize: true,
    },
    hideIcons: [''],
  };

  ngOnInit(): void {
    this.content = this.initialContent();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditorLoaded(editor: any) {
    this.editorInstance = editor;
    editor.setShowPrintMargin(false);
    console.log(`ACE Editor Ins: `, editor);
  }

  onContentChanged(event: string) {
    console.log('Content changed:', event);
    this.contentChange.emit(event);
  }

  onPreviewDomChanged(event: HTMLElement) {
    console.log('Preview DOM changed:', event);
    this.contentChange.emit(event.innerHTML);
  }

  save() {
    console.log('Save action triggered');
  }

  revert() {
    console.log('Revert action triggered');
  }

  undo() {
    this.editorInstance?.undo();
  }

  redo() {
    this.editorInstance?.redo();
  }

  doHorizontalRule() {
    this.editorInstance?.insert('\n');
    this.editorInstance?.insert('----------\n');
    this.editorInstance?.insert('\n');
  }
}
