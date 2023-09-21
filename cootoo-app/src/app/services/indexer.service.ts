import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { of } from 'rxjs'
import { Coop, MemberRestResponse, RestResponse } from '../models/coop.model';
import { CoopDetail, RestResponseDetail } from '../models/coop_detail.model';

@Injectable({
  providedIn: 'root'
})
export class IndexerService {

  private indexerURL = environment.indexerURL
  private allCoops: Coop[] = []
  // private categories: string[] = []

  constructor(private http: HttpClient) {}


  async getAllCoops() {
    const url = `${this.indexerURL}/getAllCoops`
    return this.allCoops.length > 0 ? of(this.allCoops) : this.http.get<RestResponse>(url).pipe(map(res => {
      console.log(res)
      let coopList = res.coop
      this.allCoops = coopList
      return coopList

    }))
  }


  async getCoop(contractAddress: string) {
    const url = `${this.indexerURL}/getCoop?address=${contractAddress}`
    return this.http.get<RestResponseDetail>(url).pipe(map(res => {
      console.log(res)
      if (res.coop.length == 0) return new CoopDetail()

      return res.coop[0]
    }))
  }


  async getMemberCoops(memberAddress: string) {
    const url = `${this.indexerURL}/getMemberCoops?address=${memberAddress}`
    console.log(url)
    return this.http.get<MemberRestResponse>(url).pipe(map(res => {
      // console.log(res)
      // if (res.coopMember.length == 0) return [new Coop()]
      // const coops: Coop[] = []
      // res.coopMember.forEach(coopMember => {
      //   coops.push(coopMember.coop)
      // })
      // return coops
      return res.coopMember
    }))
  }

}
