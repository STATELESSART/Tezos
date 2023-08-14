import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Profile } from '../../models/profile.model'
import { TzprofilesService } from '../../services/tzprofiles.service';
import { TzktService } from 'src/app/services/tzkt.service';
import { Nft } from 'src/app/models/nft.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public walletAddress: string = ''
  public profile: Profile = new Profile('')
  public profileReady = false
  public walletNfts: Nft[] = []

  constructor(
    private route: ActivatedRoute,
    private tzprofile: TzprofilesService,
    private tzkt: TzktService
  ) {}
 
  ngOnInit() {

    this.route.params.subscribe(async (params: Params) => {
      this.profileReady = false
      this.walletAddress = params['id'];
 
      (await this.tzprofile.getUserProfile(this.walletAddress)).subscribe(data => {
        this.profile = data
        this.profileReady = true
      });

      (await this.tzkt.getWalletNfts(this.walletAddress)).subscribe(nfts => {
        this.walletNfts = nfts
        console.log(nfts)
      });

      // (await this.indexer.getCampaignsByOwner(this.walletAddress)).subscribe(campaignList => {
      //   this.ownedCampaigns = campaignList
      // });

      // (await this.indexer.getCampaignsByDonor(this.walletAddress)).subscribe(campaignList => {
      //   this.fundedCampaigns = campaignList
      // })

    })

  }

}