import { assertEquals } from 'std/testing/asserts.ts'
import { quotesRegular } from '../asm/utils.ts'

console.log(Deno.args)

const pwd = Deno.env.get('PWD')

const programs = [
  {
    name: 'Arithmetic Sum',
    path: '/test/apsum/input.ssm',
    cases: [
      {
        name: '17',
        input: '17',
        expected: 'odd\n136\n',
      },
      {
        name: '18',
        input: '18',
        expected: 'even\n153\n',
      },
      {
        name: '3',
        input: '3',
        expected: 'odd\n3\n',
      },
    ],
  },
  {
    name: 'FizzBuzz',
    path: '/test/fizzbuzz/input.ssm',
    cases: [
      {
        name: '27',
        input: '27',
        expected:
          '12Fizz4BuzzFizz78FizzBuzz11Fizz1314FizzBuzz1617Fizz19BuzzFizz2223FizzBuzz26Fizz\n',
      },
      {
        name: '15',
        input: '15',
        expected: '12Fizz4BuzzFizz78FizzBuzz11Fizz1314FizzBuzz\n',
      },
      {
        name: '3',
        input: '3',
        expected: '12Fizz\n',
      },
      {
        name: '2',
        input: '2',
        expected: '12\n',
      },
      {
        name: '-2',
        input: '-2',
        expected: '12Fizz4Buzz\n',
      },
    ],
  },
  {
    name: 'Fib',
    path: '/test/fib/fib.ssm',
    cases: [
      {
        name: '5',
        input: '5',
        expected: '5\n',
      },
      {
        name: '10',
        input: '10',
        expected: '55\n',
      },
      {
        name: '12',
        input: '12',
        expected: '144\n',
      },
    ],
  },
  {
    name: 'Factor Loop',
    path: '/test/fact/fact.ssm',
    cases: [
      {
        name: '3',
        input: '3',
        expected: '6\n',
      },
      {
        name: '4',
        input: '4',
        expected: '24\n',
      },
      {
        name: '5',
        input: '5',
        expected: '120\n',
      },
    ],
  },
  {
    name: 'Factor Recursion',
    path: '/test/factrec/fact.ssm',
    cases: [
      {
        name: '3',
        input: '3',
        expected: '6\n',
      },
      {
        name: '4',
        input: '4',
        expected: '24\n',
      },
      {
        name: '5',
        input: '5',
        expected: '120\n',
      },
    ],
  },
  {
    name: 'Pretty string concat',
    path: '/test/pretty/input.ssm',
    cases: [
      {
        name: 'default',
        input: '',
        expected: 'albatross3squirqs shpatel 5\n',
      },
    ],
  },
]

const _decoder = new TextDecoder()
const decode = (array: Uint8Array) => _decoder.decode(array)
programs.forEach(({ name: programName, path, cases }) => {
  Deno.test(programName, async (t) => {
    for await (const { name, input, expected } of cases) {
      await t.step(name, async () => {
        const command = `task run ${pwd}${path} --args=${input}`.split(
          quotesRegular
        )
        //console.log(command)
        const output = await new Deno.Command(Deno.execPath(), {
          args: command,
        }).output()

        assertEquals(decode(output.stdout), expected)
      })
    }
  })
})
