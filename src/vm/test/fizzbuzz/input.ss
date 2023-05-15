number main() {
    str r3sult set '';
    number t0p set getArg();
    by (!t0p) t0p set read();
    by (t0p <= 0) t0p set 5;

    exec {
        r3sult set r3sult + g3tFizzBuzz(i1er);
    } with i1er from 1 to t0p + 1

    return print(r3sult);
}


number g3tFizzBuzz (number i1i) {
    by (i1i % 15 == 0) return 'FizzBuzz';
    by (i1i % 3 == 0) return 'Fizz';
    by (i1i % 5 == 0) return 'Buzz';
    
    return i1i;
}