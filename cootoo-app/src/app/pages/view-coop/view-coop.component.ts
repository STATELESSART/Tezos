import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Coop } from 'src/app/models/coop.model';
import { Nft } from 'src/app/models/nft.model';
import { TzktService } from 'src/app/services/tzkt.service';


@Component({
  selector: 'app-view-coop',
  templateUrl: './view-coop.component.html',
  styleUrls: ['./view-coop.component.scss']
})
export class ViewCoopComponent implements OnInit {

  coop: Coop = new Coop()
  coopNfts: Nft[] = []

  constructor(
    private route: ActivatedRoute,
    private tzkt: TzktService
  ){}

  async ngOnInit() {

    this.route.params.subscribe(async (params: Params) => {
      this.coop.contract = params['id'];

      (await this.tzkt.getCoop(this.coop.contract)).subscribe(coop => {
        this.coop = coop
      });

      (await this.tzkt.getCoopNfts(this.coop.contract)).subscribe(nfts => {
          this.coopNfts = nfts
      })
    });

  }



}
