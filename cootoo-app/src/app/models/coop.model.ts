export class Coop {
    address!: string;
    coop_share!: number;
    manager!: string;
    members!: string[];
    name!: string;
    description!: string;
    image!: string;
    // tags!: string[];
    tez_limit!: number
    // proposed_manager!: string;

    fromCoopTzkt(input: CoopRes, coop_address: string): this {
      console.log(input)
      console.log(this)
      this.address = coop_address; 
      this.coop_share = input.coop_share;
      this.manager = input.manager;
      this.members = input.members; 
      this.name = '';
      this.description = '';
      this.image = '';
      this.tez_limit = input.tez_limit;
      return this;
    }
  } 


  export class CoopRes {
    // // address!: string;
    // coop_share!: number;
    // manager!: Member;
    // members!: CoopMember[];
    // metadata!: Metadata
    // // tags!: string[];
    // tez_limit!: number
    // // proposed_manager!: string;

    swaps!: number;
    counter!: number;
    manager!: string;
    members!: string[];
    metadata!: number;
    tez_limit!: number;
    coop_share!: number;
    swaps_paused!: boolean;
    collects_paused!: boolean;
    factory_address!: string;
    proposed_manager!: string | null;
  } 

  export class Metadata {
    name!: string;
    description!: string;
    image!: string;
  }

  export class CoopMember {
    member!: Member;
    tezReceived!: number;
    status!: number;
    coop!: Coop;
  }

  export class Member {
    address!: string
    name!: string;
  }

  export class RestResponse {
    coop: Coop[] = []
  } 


  export class MemberRestResponse {
    coopMember: CoopMember[] = []
  } 