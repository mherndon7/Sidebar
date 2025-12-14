import { Component, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly activeTool: WritableSignal<string>;
  protected readonly collapsed: WritableSignal<boolean>;

  constructor() {
    this.activeTool = signal('home');
    this.collapsed = signal(false);
  }

  protected onActive(tool: string): void {
    this.activeTool.set(tool);
  }
}
