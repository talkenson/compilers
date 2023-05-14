import { LangEntity } from './base'

export type IdParams = {
  name: string
}

export class Id extends LangEntity<IdParams> {
  constructor(
    params = {
      name: '',
    }
  ) {
    super(params)
  }

  toRpn() {
    return this.params.name
  }

  toASM(): string {
    return this.params.name
  }
}
