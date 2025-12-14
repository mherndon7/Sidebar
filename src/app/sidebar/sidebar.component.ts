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
    public expanded: boolean = false,
    options?: ToolOption[],
    iconViewBox?: string,
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
  protected readonly activeTool: WritableSignal<ToolGroup>;
  protected readonly collapsing: WritableSignal<boolean>;
  protected readonly collapsed: WritableSignal<boolean>;

  protected hideTextTimer?: number;

  protected readonly groups: ToolGroup[] = [
    new ToolGroup('Home', 'house'),
    new ToolGroup('Models', 'rocket-takeoff', true, [{ id: 'add-model', label: 'Add Model' }]),
    new ToolGroup('Configurations', 'stack'),
    new ToolGroup('Results', 'database'),
    new ToolGroup('Plots', 'graph-up', true, [
      { id: 'line-plot', label: 'Line Plot' },
      { id: 'contour-plot', label: 'Contour Plot' },
      { id: 'safety-fan', label: 'Safety Fan' },
    ]),
    new ToolGroup('Submission', 'terminal'),
  ];

  protected readonly coreGroups: ToolGroup[] = [
    new ToolGroup('Change Log', 'clock-history'),
    new ToolGroup('Settings', 'gear'),
    // new ToolGroup('Help', 'question-circle'),
  ];

  constructor() {
    this.activeTool = signal(this.groups[0]);
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

  protected onActive(tool: ToolGroup): void {
    if (tool.expandable && !this.collapsed()) tool.expanded = !tool.expanded;
    this.activeTool.set(tool);
  }
}
