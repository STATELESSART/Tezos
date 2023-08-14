import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

// import { Component, ElementRef, OnInit, ViewChild, HostBinding } from '@angular/core';
import { FormControl } from '@angular/forms';
// import { OverlayContainer } from '@angular/cdk/overlay';
import { Observable } from 'rxjs'
import { TzprofilesService } from './services/tzprofiles.service';
import { Profile } from './models/profile.model'
import { AccountInfo } from '@airgap/beacon-sdk'
import { Store } from '@ngrx/store'
import { State } from 'src/app/app.reducer'
import * as actions from './connect-wallet.actions'
// import { environment } from 'src/environments/environment';
// import { SeoService } from './services/seo-service.service';
// import { Router, Event, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap, observeOn, scan  } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  appName = environment.appName
  // supportUsContract = environment.supportUsContract
  // githubURL = environment.githubURL
  // twitterURL = environment.twitterURL

  profile: Profile = new Profile('')
  connectedWallet$: Observable<AccountInfo | undefined>
  ownAddress: string | undefined
  toggleDark = new FormControl(false);

  constructor(
    private readonly store$: Store<State>,
    // private overlay: OverlayContainer,
    private tzprofile: TzprofilesService,
    // private router: Router, 
    // private activatedRoute: ActivatedRoute, 
    // private seoService: SeoService
  ) {
    this.connectedWallet$ = this.store$.select(
      (state) => (state as any).app.connectedWallet as AccountInfo | undefined
    )

    // if (!this.toggleDark.value) {
    //   this.className = 'darkMode';
    //   this.overlay.getContainerElement().classList.add('darkMode');
    // }

  } 
 
  ngOnInit() {

    this.store$.dispatch(actions.setupBeacon())

    this.connectedWallet$.subscribe(async accountInfo => {
      this.ownAddress = accountInfo?.address
      if (this.ownAddress) {
        (await this.tzprofile.getUserProfile(this.ownAddress)).subscribe(profile => {
          this.profile = profile
        })
      }
    })


  //   this.toggleDark.valueChanges.subscribe((darkMode) => {
  //     const darkClassName = 'darkMode';
  //     this.className = !darkMode ? darkClassName : '';

  //     if (darkMode) {
  //       this.overlay.getContainerElement().classList.remove(darkClassName);

  //       const navbarImg = document.getElementById('navbar-brand-img')
  //       navbarImg?.setAttribute('src', '../assets/FUNDlight.svg')

  //       const navbarImgOffcanvas = document.getElementById('navbar-brand-img-offcanvas')
  //       navbarImgOffcanvas?.setAttribute('src', '../assets/FUNDlight.svg')
  //     } else {
  //       this.overlay.getContainerElement().classList.add(darkClassName);

  //       const navbarImg = document.getElementById('navbar-brand-img')
  //       navbarImg?.setAttribute('src', '../assets/FUNDdark.svg')

  //       const navbarImgOffcanvas = document.getElementById('navbar-brand-img-offcanvas')
  //       navbarImgOffcanvas?.setAttribute('src', '../assets/FUNDdark.svg')
  //     }
      
  //   });


  //   // META TAGS
  //   this.router.events.pipe(
  //     filter(e => e instanceof NavigationEnd),
  //     map(e => this.activatedRoute),
  //     map((route) => {
  //       while (route.firstChild) route = route.firstChild;
  //       return route;
  //     }),
  //     filter((route) => route.outlet === 'primary'),
  //     mergeMap((route) => route.data),
  //   ).subscribe(data => {
  //     let seoData = data['seo'];
  //     this.seoService.updateTitle(seoData['title']);
  //     this.seoService.updateMetaTags(seoData['metaTags']);
  //   });

    
   
  //   // SCROLL
  //   this.router.events.pipe(
  //     filter(
  //       event =>
  //         event instanceof NavigationStart || event instanceof NavigationEnd,
  //     ),
  //     scan<any>((acc, event) => ({
  //           event,
  //           positions: {
  //             ...acc.positions,
  //             ...(event instanceof NavigationStart
  //               ? {
  //                   [event.id]: this.content.nativeElement.scrollTop,
  //                 }
  //               : {}),
  //           },
  //           trigger:
  //             event instanceof NavigationStart && event.navigationTrigger
  //               ? event.navigationTrigger 
  //               : acc.trigger,
  //           idToRestore:
  //             (event instanceof NavigationStart &&
  //               event.restoredState &&
  //               event.restoredState.navigationId + 1) ||
  //             acc.idToRestore, 
  //         })
  //     ),
  //     filter(
  //       ({ event, trigger }: ScrollPositionRestore) => event instanceof NavigationEnd && !!trigger,
  //     ),
  //     observeOn(asyncScheduler),
  //   ).subscribe(({ trigger, positions, idToRestore }) => {

  //     if (trigger === 'imperative') {
  //       this.content.nativeElement.scrollTop = 0;
  //     }

  //     if (trigger === 'popstate') {
  //       this.content.nativeElement.scrollTop = positions[idToRestore];
  //     }
  //   });

  }


  connectWallet() { 
    console.log('connect')
    this.store$.dispatch(actions.connectWallet())
  }

  disconnectWallet() {
    console.log('disconnect')
    this.store$.dispatch(actions.disconnectWallet())
  }


  toggleMenu() {
    const myOffcanvas = document.getElementById('offcanvasNavbar')
    myOffcanvas?.classList.remove('show')
    myOffcanvas?.classList.add('toggle')
  }

}
