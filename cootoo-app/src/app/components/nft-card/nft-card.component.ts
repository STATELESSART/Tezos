import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Nft } from 'src/app/models/nft.model';
import { Swap } from 'src/app/models/swap.model';
import { TaquitoService } from 'src/app/services/taquito.service';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss']
})
export class NftCardComponent {

  @Input() nft: Nft | null = null
  @Input() swap: Swap | null = null

  constructor(
    private taquito: TaquitoService
  ){}
  
  collect() {

    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      if (this.swap) {

        this.nft = this.swap.token


        // const loadingDialog = this.openDialog(false, false, '', true)


        await this.taquito.collect(this.swap.id, this.swap.price).then(([fail, errorMessage]) => {
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
