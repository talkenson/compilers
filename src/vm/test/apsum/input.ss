number main() {
    number t0pShelf set 17;
    number i7put set getArg();
    by (!i7put) i7put set read();
    by (i7put > 0) t0pShelf set i7put;
    
    r3sult set s4num(t0pShelf, 0);

    return print(r3sult);
}

number s4num(number t0p, number s74rt) {
    by (t0p == s74rt) return t0p;

    c0unt set 0;

    str t7pe set '';

    by (t0p % 2 == 0) t7pe set 'even';
    else t7pe set 'odd';

    v0id set print(t7pe);

    by (t0p > s74rt) {
        exec {
            c0unt set c0unt + i1er;
        } with i1er from s74rt to t0p
    } else {
        exec {
            c0unt set c0unt + i1er;
        } with i1er from t0p to s74rt
    }

    return c0unt;
}