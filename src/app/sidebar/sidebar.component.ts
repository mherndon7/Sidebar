import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, signal, WritableSignal } from '@angular/core';
import {
  NgbCollapse,
  NgbDropdown,
  NgbDropdownAnchor,
  NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
} from '@ng-bootstrap/ng-bootstrap';

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

  isChild(group: ToolOption): boolean {
    return this.options.some((option) => option.id === group.id);
  }

  get expandable(): boolean {
    return this.options.length > 0;
  }
}

@Component({
  selector: 'app-sidebar',
  imports: [
    NgTemplateOutlet,
    NgbCollapse,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbDropdownButtonItem,
    NgbDropdownAnchor,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly activeTool: WritableSignal<ToolOption>;
  protected readonly collapsing: WritableSignal<boolean>;
  protected readonly collapsed: WritableSignal<boolean>;

  protected hideTextTimer?: number;
  protected dropdownHovered: boolean;

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
    this.dropdownHovered = false;

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

  protected onActive(tool: ToolGroup, dropdown: NgbDropdown): void {
    if (tool.expandable && !this.collapsed()) {
      tool.expanded = !tool.expanded;
      if (tool.expanded) dropdown.close();
    } else {
      this.activeTool.set(tool);
    }
  }

  protected onActiveOption(option: ToolOption): void {
    this.activeTool.set(option);
  }

  protected isActiveGroup(group: ToolGroup): boolean {
    const isCollapsed = !group.expanded || this.collapsed();
    return this.activeTool().id === group.id || (isCollapsed && group.isChild(this.activeTool()));
  }

  protected onHover(group: ToolGroup, dropdown: NgbDropdown): void {
    if (group.expandable && (this.collapsed() || !group.expanded)) dropdown.open();
  }

  protected onLeave(dropdown: NgbDropdown): void {
    setTimeout(() => {
      if (!this.dropdownHovered) dropdown.close();
    }, 10);
  }

  protected onHoverDropdownMenu(hovered: boolean, dropdown: NgbDropdown): void {
    this.dropdownHovered = hovered;
    if (!hovered) dropdown.close();
  }
}
