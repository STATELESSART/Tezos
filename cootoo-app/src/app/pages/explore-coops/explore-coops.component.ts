import { Component, OnInit } from '@angular/core';
import { Coop } from 'src/app/models/coop.model';
import { IndexerService } from 'src/app/services/indexer.service';
// import { map } from 'rxjs';

@Component({
  selector: 'app-explore-coops',
  templateUrl: './explore-coops.component.html',
  styleUrls: ['./explore-coops.component.scss']
})
export class ExploreCoopsComponent implements OnInit {

  coops: Coop[] = []

  constructor(
    private indexer: IndexerService
  ){}

  async ngOnInit() {
    (await this.indexer.getAllCoops()).subscribe(coops => {
      this.coops = coops
      console.log(coops)
    });
  }
}
