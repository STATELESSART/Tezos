
import { Coop } from "./coop.model";
import { Swap } from "./swap.model";

export class CoopDetail extends Coop {
  swaps: Swap[] = []

}

export class RestResponseDetail {
  coop: CoopDetail[] = []
} 