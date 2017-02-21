import { Component } from '@angular/core';

import { NearbyPage } from '../nearby/nearby';
import { AboutPage } from '../about/about';
import { ArtistPage } from '../artist/artist';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = NearbyPage;
  tab2Root: any = AboutPage;
  tab3Root: any = ArtistPage;

  constructor() {

  }
}
