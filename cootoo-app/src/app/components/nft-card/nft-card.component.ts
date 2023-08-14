import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Nft } from 'src/app/models/nft.model';
import { TaquitoService } from 'src/app/services/taquito.service';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss']
})
export class NftCardComponent {

  @Input() nft: Nft | null = new Nft()

  constructor(
    private taquito: TaquitoService
  ){}
  
  collect() {

    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      if (this.nft?.swap) {


        // const loadingDialog = this.openDialog(false, false, '', true)


        await this.taquito.collect(this.nft?.swap.swap_id, this.nft?.swap.xtz_per_objkt).then(([fail, errorMessage]) => {
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
