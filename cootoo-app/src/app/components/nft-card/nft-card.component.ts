import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Nft } from 'src/app/models/nft.model';
import { Swap, SwapParam } from 'src/app/models/swap.model';
import { TaquitoService } from 'src/app/services/taquito.service';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss']
})
export class NftCardComponent {

  @Input() nft: Nft | undefined = undefined
  @Input() swap: SwapParam | undefined = undefined

  constructor(
    private taquito: TaquitoService
  ){}
  
  collect() {

    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      if (this.swap) {

        this.nft = this.swap.nft

        console.log(this.swap)
        // const loadingDialog = this.openDialog(false, false, '', true)


        await this.taquito.collect(this.swap.coop_address, this.swap.id, this.swap.xtz_per_objkt).then(([fail, errorMessage]) => {
          if (!fail) {
            const dialogMessage = 'Sucess collect'
            console.log(dialogMessage)
            // this.successDialog(loadingDialog, dialogMessage)
          } else {
            console.log(errorMessage)
            // this.failDialog(loadingDialog, errorMessage)
          }
        })

      }

      

    })
  }
    
  

}
