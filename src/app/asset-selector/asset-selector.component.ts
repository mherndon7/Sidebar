import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
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
export class AssetSelectorComponent {
  @ViewChild('instance', { static: true }) instance!: NgbTypeahead;

  readonly assets: string[] = ['Model 1', 'Model 22', 'Model 3', 'Model 4', 'Model 5', 'unique'];
  protected asset: string = 'Model 4';

  protected focus$ = new Subject<string>();
  protected click$ = new Subject<string>();

  protected search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(0), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));

    return merge(debouncedText$, this.focus$, clicksWithClosedPopup$).pipe(
      map((term: string) =>
        (term === ''
          ? this.assets
          : this.assets.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
        ).slice(0, 10),
      ),
    );
  };
}
