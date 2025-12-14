import { Component, effect, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly activeTool: WritableSignal<string>;
  protected readonly collapsing: WritableSignal<boolean>;
  protected readonly collapsed: WritableSignal<boolean>;

  protected hideTextTimer?: number;

  constructor() {
    this.activeTool = signal('home');
    this.collapsing = signal(false);
    this.collapsed = signal(false);

    effect(() => {
      if (this.collapsing()) {
        clearTimeout(this.hideTextTimer);
        this.hideTextTimer = setTimeout(() => {
          this.collapsed.set(true);
        }, 200);
      } else {
        clearTimeout(this.hideTextTimer);
        this.collapsed.set(false);
      }
    });
  }

  protected onActive(tool: string): void {
    this.activeTool.set(tool);
  }
}
