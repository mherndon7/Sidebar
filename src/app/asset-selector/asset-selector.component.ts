import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  linkedSignal,
  OnDestroy,
  signal,
  ViewChild,
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  OperatorFunction,
  Subject,
  merge,
} from 'rxjs';

@Component({
  selector: 'app-asset-selector',
  imports: [NgbTypeahead, FormsModule],
  templateUrl: './asset-selector.component.html',
  styleUrl: './asset-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AssetSelectorComponent implements OnDestroy {
  @ViewChild('instance', { static: false })
  private readonly typeAhead?: NgbTypeahead;

  @ViewChild('instance', { static: false, read: ElementRef })
  private readonly typeAheadElement?: ElementRef;

  readonly assets: string[] = [
    'Model 1',
    'Model 2',
    'Model 22',
    'Model 3',
    'Model 4',
    'Model 5',
    'unique',
  ] as const;

  protected readonly active: WritableSignal<boolean>;
  protected readonly asset: WritableSignal<string>;
  protected readonly assetFocus: WritableSignal<string>;

  protected readonly previousAsset: WritableSignal<string> = linkedSignal({
    source: () => this.asset(),
    computation: (
      newValue: string,
      previous:
        | {
            source: string;
            value: string;
          }
        | undefined,
    ) => newValue ?? previous?.value ?? this.assets[0],
  });

  protected readonly click$ = new Subject<string>();

  constructor() {
    this.active = signal(false);
    this.asset = signal<string>(this.assets[0]);
    this.assetFocus = signal<string>('');
  }

  ngOnDestroy(): void {
    this.click$.complete();
  }

  protected search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(0), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.typeAhead?.isPopupOpen()));

    return merge(debouncedText$, this.assetFocus(), clicksWithClosedPopup$).pipe(
      map((term: string) =>
        term === '' || !this.typeAhead?.isPopupOpen()
          ? this.assets
          : this.assets.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1),
      ),
    );
  };

  protected selectAsset(): void {
    this.asset.set(this.asset() ?? this.previousAsset());
    this.active.set(false);
  }

  protected activate(): void {
    this.active.set(true);

    setTimeout(() => {
      this.click$.next(this.asset());
      this.typeAheadElement?.nativeElement.select();
    }, 0);
  }

  protected typeaheadKeydown($event: KeyboardEvent): void {
    // https://stackblitz.com/edit/angular-utd9ii?file=app%2Ftypeahead-scrollable.html
    const instance = this.typeAhead;
    if (!instance || !instance.isPopupOpen()) return;

    setTimeout(() => {
      const popup = document.getElementById(instance.popupId);
      const activeElements = popup?.getElementsByClassName('active');

      if (activeElements?.length === 1) {
        const elem = activeElements[0] as any;
        if (typeof elem.scrollIntoViewIfNeeded === 'function') {
          // Non standard function, but works (in chrome)...
          elem.scrollIntoViewIfNeeded();
        } else {
          // Do custom scroll calculation or use jQuery Plugin or ...
          this.scrollIntoViewIfNeededPolyfill(elem as HTMLElement);
        }
      }
    });
  }

  private scrollIntoViewIfNeededPolyfill(elem: HTMLElement, centerIfNeeded = true): void {
    const parent = elem.parentElement;
    if (parent == null) return;

    const parentComputedStyle = window.getComputedStyle(parent, null);
    const parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width'));
    const parentBorderLeftWidth = parseInt(
      parentComputedStyle.getPropertyValue('border-left-width'),
    );
    const overTop = elem.offsetTop - parent.offsetTop < parent.scrollTop;
    const overBottom =
      elem.offsetTop - parent.offsetTop + elem.clientHeight - parentBorderTopWidth >
      parent.scrollTop + parent.clientHeight;
    const overLeft = elem.offsetLeft - parent.offsetLeft < parent.scrollLeft;
    const overRight =
      elem.offsetLeft - parent.offsetLeft + elem.clientWidth - parentBorderLeftWidth >
      parent.scrollLeft + parent.clientWidth;
    const alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop =
        elem.offsetTop -
        parent.offsetTop -
        parent.clientHeight / 2 -
        parentBorderTopWidth +
        elem.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft =
        elem.offsetLeft -
        parent.offsetLeft -
        parent.clientWidth / 2 -
        parentBorderLeftWidth +
        elem.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      elem.scrollIntoView(alignWithTop);
    }
  }
}
