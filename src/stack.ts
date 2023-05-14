export class Stack<T> {
  private stack: T[] = []

  set(value: T[]) {
    this.stack = value
  }

  push(...values: T[]) {
    return this.stack.push(...values)
  }

  pop() {
    return this.stack.pop()
  }

  popMany(count: number) {
    if (count > this.stack.length) throw new Error('Stack exceeded')

    if (count === 0) return []

    return this.stack.splice(-count)
  }

  peek() {
    return this.stack.at(-1)
  }

  export() {
    return this.stack.join(', ')
  }

  get value() {
    return this.stack
  }

  get length() {
    return this.stack.length
  }

  toString() {
    return `Stack {${this.export()}}`
  }
}
