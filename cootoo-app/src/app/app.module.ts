import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store'
import { reducers, metaReducers } from './reducers'
import { EffectsModule } from '@ngrx/effects'
import { AppEffects } from  './app.effects'
import { ConnectWalletEffects } from './connect-wallet.effects';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateCoopComponent } from './pages/create-coop/create-coop.component'
import { ExploreCoopsComponent } from './pages/explore-coops/explore-coops.component';
import { ViewCoopComponent } from './pages/view-coop/view-coop.component';
import { SwapNftComponent } from './pages/swap-nft/swap-nft.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NftCardComponent } from './components/nft-card/nft-card.component';
import { SafePipe } from './pipes/safe.pipe';
import { ShortenPipe } from './pipes/shorten.pipe';
import { IpfsPipe } from './pipes/ipfs.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CreateCoopComponent,
    ExploreCoopsComponent,
    ViewCoopComponent,
    SwapNftComponent,
    ProfileComponent,
    NftCardComponent,
    SafePipe,
    ShortenPipe,
    IpfsPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
    }),
    EffectsModule.forRoot([AppEffects, ConnectWalletEffects]),
    MatToolbarModule,
    MatListModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
