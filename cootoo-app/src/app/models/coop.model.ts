export class Coop {
    address!: string;
    coopShare!: number;
    manager!: Member;
    members!: CoopMember[];
    // proposed_manager!: string;
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