import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  linkedSignal,
  OnDestroy,
  Signal,
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
  of,
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
        (term === ''
          ? this.assets
          : this.assets.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
        ).slice(0, 10),
      ),
    );
  };

  protected selectAsset() {
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
}
