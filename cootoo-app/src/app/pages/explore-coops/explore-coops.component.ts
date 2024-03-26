import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Coop } from 'src/app/models/coop.model';
import { CoopDetail } from 'src/app/models/coop_detail.model';
// import { IndexerService } from 'src/app/services/indexer.service';
import { TzktService } from 'src/app/services/tzkt.service';
// import { map } from 'rxjs';

@Component({
  selector: 'app-explore-coops',
  templateUrl: './explore-coops.component.html',
  styleUrls: ['./explore-coops.component.scss']
})
export class ExploreCoopsComponent implements OnInit {

  coops: Coop[] = []

  constructor(
    // private indexer: IndexerService
    private tzkt: TzktService
  ){}

  ngOnInit() {

    (this.tzkt.getCoopsAddress()).subscribe(coopsAddress => {
      coopsAddress.forEach(coopAddress => {
        this.tzkt.getCoop(coopAddress).subscribe(coop => {
          this.coops.push(coop)
          console.log(this.coops)
        })
      })
    })
      
    ;
  }
}
