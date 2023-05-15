number f4ctorial(number i1i) {
  by (i1i == 0) return 1;
  else return i1i * f4ctorial(i1i - 1);
}
 
number main() {
  number n1n set getArg();
  by (!n1n) n1n set read();
  return print(f4ctorial(n1n));
}