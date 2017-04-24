
import { Component } from '@angular/core';

import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { VenueService } from '../../services/venue.service';
import { ArtistService } from '../../services/artist.service';

import { TipPage } from './../tip/tip';
import { ArtistPage } from './../artist/artist';


@Component({
  selector: 'venue-details-page',
  templateUrl: 'venue-details.html'
})
export class VenueDetailsPage {
  selectedVenue: any;
  localPhoto: string;
  artists: Array<any>;
  localArtistEmail: string;
  localArtistName: string;
  hideCheckInButton: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams, private venueService: VenueService, private artistService: ArtistService, public loading: LoadingController) {
    // If we navigated to this page, we will have an venue available as a nav param
    this.selectedVenue = navParams.data.item.venue;
    this.getVenuePhoto(this.selectedVenue.id);
  }

  // As compared to ngOnInit(), this is called every time this page loads; even when you come "Back" to it
  ionViewWillEnter() { 
    let loader = this.loading.create();

    loader.present().then(() => {
      this.initializePage(null, loader);
    });
  }

  initializePage(refresher?, loader?) {
    this.initializeLocalArtistEmail()
      .then((val) => {
        this.initializeLocalArtistName();
        this.localArtistEmail = val;
        this.getArtists(this.selectedVenue.id, refresher, loader);
      }
      );
  }

  getVenuePhoto(venueId: string): void {
    this.venueService.getPhotoForVenue(venueId).then(venuePhoto => {
      if (venuePhoto) {
        this.localPhoto = (venuePhoto.prefix + 'original' + venuePhoto.suffix);
      }
    });
  }

  getArtists(venueId: string, refresher?, loader?): void {
    this.venueService.getArtistsAtVenue(venueId).then(artists => {
      this.artists = artists;
      if (this.artists.length < 10) {
        // Find out if the current artist is already checked in here. If they are, don't even show the button to check in.
        let artistFound = false;
        if (this.localArtistEmail) {
          for (var i = 0; i < artists.length; i++) {
            if (artists[i].id == this.localArtistEmail) {
              artistFound = true;
            }
          }
        }
        if (!artistFound) {
          this.hideCheckInButton = false;
        }
      } else {
        // If there are already 10 people checked in here, put a stop to the madness.
        this.hideCheckInButton = true;
      }
      if (loader)
        loader.dismiss();
      if (refresher)
        refresher.complete();
    });
  }

  initializeLocalArtistEmail(): Promise<any> {
    return this.artistService.getArtistEmail();
  }

  initializeLocalArtistName(): void {
    this.artistService.getArtistName().then((val) => {
      this.localArtistName = val;
    });
  }

  artistTapped(event, artist) {
    this.navCtrl.push(TipPage, {
      artist: artist,
      venuePhoto: this.localPhoto
    });
  }

  artistCheckInTapped(event) {
    if (this.localArtistEmail && this.localArtistName) {
      // TODO: some sort of confirmation here

      this.venueService.checkArtistInToVenue(this.localArtistEmail, this.selectedVenue.id, this.localArtistName)
        .then((res) => {
          this.artists[this.artists.length] = {
            "id": this.localArtistEmail,
            "name": this.localArtistName
          };
          this.hideCheckInButton = true;
        });
    } else {
      // They're not set up as an artist, so send 'em to the artist info page.
      this.navCtrl.push(ArtistPage, {});
    }
  }

  // Event for the pull-down-to-refresh.
  doRefresh(refresher) {
    this.initializePage(refresher);
  }

}
