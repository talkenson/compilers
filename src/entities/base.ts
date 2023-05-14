export abstract class LangEntity<T = unknown> {
  static counter = 0

  readonly __type__ = this.constructor.name
  readonly id = LangEntity.counter

  get asmId() {
    return `${this.__type__}_${this.id}`
  }

  constructor(public readonly params: T = {} as T) {
    LangEntity.counter++
  }

  static getLabel(label: string, type: string, id: number) {
    return `$${label}_${type}_${id}:`
  }

  getLabel(label: string) {
    return LangEntity.getLabel(label, this.__type__, this.id)
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.params[key] = value
  }

  abstract toRpn(): string

  abstract toASM(): string
}
