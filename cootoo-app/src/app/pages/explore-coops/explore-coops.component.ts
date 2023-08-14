import { Component, OnInit } from '@angular/core';
import { TzktService } from 'src/app/services/tzkt.service';
import { Coop } from 'src/app/models/coop.model';
// import { map } from 'rxjs';

@Component({
  selector: 'app-explore-coops',
  templateUrl: './explore-coops.component.html',
  styleUrls: ['./explore-coops.component.scss']
})
export class ExploreCoopsComponent implements OnInit {

  coops: Coop[] = []

  constructor(
    private tzkt: TzktService
  ){}

  async ngOnInit() {
    (await this.tzkt.getCoopsAddress()).subscribe(res => {
      console.log(res)
      res.forEach(coopAddress => {
        this.tzkt.getCoop(coopAddress).then(res=>res.subscribe(coop => 
          this.coops.push(coop)
        ))
        // coopAddressList.push(orig['originatedContract']['address'])
      });
      // this.coops = res
    });
  }
  // getCoops() {
  //   this.tzkt.getCoops()
  // }
}
