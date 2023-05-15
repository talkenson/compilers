number main() {
    number n1n set getArg();
    by (!n1n) n1n set read();
    r3s set 1;

    exec {
        r3s set r3s * i1i;
    } with i1i from 1 to n1n + 1

    v0id set print(r3s);
    return 0;
}