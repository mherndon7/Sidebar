import { Component, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly activeTool: WritableSignal<string>;

  constructor() {
    this.activeTool = signal('home');
  }

  protected onActive(tool: string): void {
    this.activeTool.set(tool);
  }
}
