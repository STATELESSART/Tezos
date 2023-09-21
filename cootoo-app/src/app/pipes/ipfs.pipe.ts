import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'ipfs',
})
export class IpfsPipe implements PipeTransform {
  public transform(value: string, args: { ifMatches?: string | RegExp } = {}) {
    if (!value || !(typeof value === 'string')) {
      return ''
    }

    const hash = value.replace("ipfs://", "")
    const url = 'https://ipfs.io/ipfs/' + hash

    return url
  }
}