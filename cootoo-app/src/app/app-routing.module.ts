import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateCoopComponent } from './pages/create-coop/create-coop.component';
import { ExploreCoopsComponent } from './pages/explore-coops/explore-coops.component';
import { ViewCoopComponent } from './pages/view-coop/view-coop.component';
import { SwapNftComponent } from './pages/swap-nft/swap-nft.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: 'create',
    component: CreateCoopComponent,
    data: {
      seo: {
        title: 'Create a coop',
        metaTags: [
          // { name: 'description', content: description },
        ]
      }
    }
  },
  {
    path: 'coops',
    component: ExploreCoopsComponent,
    data: {
      seo: {
        title: 'Explore',
        metaTags: [
          // { name: 'description', content: description },
        ]
      }
    }
  },
  {
    path: 'coop/:id',
    component: ViewCoopComponent,
    data: {
      seo: {
        title: 'Coop',
        metaTags: [
          // { name: 'description', content: description },
        ]
      }
    }
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    data: {
      seo: {
        title: 'Profile',
        metaTags: [
          // { name: 'description', content: description },
        ]
      }
    }
  },
  {
    path: 'nft/:fa2_address/:objkt_id',
    component: SwapNftComponent,
    data: {
      seo: {
        title: 'NFT',
        metaTags: [
          // { name: 'description', content: description },
        ]
      }
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

