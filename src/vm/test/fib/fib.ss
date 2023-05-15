number f1b(number n4m, number l0gging) {
    by (n4m == 1) {
        by (l0gging) v0id set print('Fib for', n4m, 'is', 1);
        return 1;
    }
    by (n4m <= 0) {
        by (l0gging) v0id set print('Fib for', n4m, 'is', 0);
        return 0;
    }
    r3sult set f1b(n4m - 1, l0gging) + f1b(n4m - 2, l0gging);
    by (l0gging) v0id set print('Fib for', n4m, 'is', r3sult);
    return r3sult;
}


number main() {
    number t0p set getArg();
    by (!t0p) t0p set read();
    by (t0p < 0) t0p set 0;

    l0g set env('LOG') == 1; 

    r3sult set f1b(t0p, l0g);
    v0id set print(r3sult);
    return r3sult;
}