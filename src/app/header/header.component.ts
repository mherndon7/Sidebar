import { Component } from '@angular/core';
import { AssetSelectorComponent } from '../asset-selector/asset-selector.component';

@Component({
  selector: 'app-header',
  imports: [AssetSelectorComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {}
