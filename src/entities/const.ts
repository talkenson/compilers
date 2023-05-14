import { LangEntity } from './base'

export type ConstParams = {
  value: string
  type: string
}

export class Const extends LangEntity<ConstParams> {
  constructor(
    params = {
      value: '',
      type: '',
    }
  ) {
    super(params)
  }

  toRpn() {
    return this.params.value
  }

  toASM(): string {
    return this.params.value
  }
}
