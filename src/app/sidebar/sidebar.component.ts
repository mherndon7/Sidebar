import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, signal, WritableSignal } from '@angular/core';

interface ToolOption {
  readonly id: string;
  readonly label: string;
}
class ToolGroup implements ToolOption {
  readonly id: string;
  readonly iconViewBox: string;
  readonly options: ToolOption[];

  constructor(
    readonly label: string,
    readonly icon: string,
    options?: ToolOption[],
    iconViewBox?: string
  ) {
    this.id = label.toLocaleLowerCase();
    this.options = options ?? [];
    this.iconViewBox = iconViewBox ?? '0 0 16 16';
  }

  get expandable(): boolean {
    return this.options.length > 0;
  }
}

@Component({
  selector: 'app-sidebar',
  imports: [NgTemplateOutlet],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly activeTool: WritableSignal<string>;
  protected readonly collapsing: WritableSignal<boolean>;
  protected readonly collapsed: WritableSignal<boolean>;

  protected hideTextTimer?: number;

  protected readonly groups: ToolGroup[] = [
    new ToolGroup('Home', 'house'),
    new ToolGroup('Models', 'rocket-takeoff'),
    new ToolGroup('Configurations', 'stack'),
    new ToolGroup('Results', 'database'),
    new ToolGroup('Plots', 'graph-up'),
    new ToolGroup('Submission', 'terminal'),
  ];

  protected readonly coreGroups: ToolGroup[] = [
    new ToolGroup('Change Log', 'clock-history'),
    new ToolGroup('Settings', 'gear'),
    // new ToolGroup('Help', 'question-circle'),
  ];

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
