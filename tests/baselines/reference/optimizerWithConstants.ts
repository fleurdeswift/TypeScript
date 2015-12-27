const TEST_NUMBER = 1;
const TEST_BOOL = true;

console.log("TEST_NUMBER <   1 ->", TEST_NUMBER < 1);
console.log("TEST_NUMBER <=  1 ->", TEST_NUMBER <= 1);
console.log("TEST_NUMBER >   1 ->", TEST_NUMBER > 1);
console.log("TEST_NUMBER >=  1 ->", TEST_NUMBER >= 1);
console.log("TEST_NUMBER ==  1 ->", TEST_NUMBER == 1);
console.log("TEST_NUMBER === 1 ->", TEST_NUMBER === 1);
console.log("TEST_NUMBER |   0 ->", TEST_NUMBER | 0);
console.log("TEST_NUMBER |   1 ->", TEST_NUMBER | 1);
console.log("TEST_NUMBER |   2 ->", TEST_NUMBER | 2);
console.log("TEST_NUMBER ||  0 ->", TEST_NUMBER || 0);
console.log("TEST_NUMBER ||  1 ->", TEST_NUMBER || 1);
console.log("TEST_NUMBER &   0 ->", TEST_NUMBER & 0);
console.log("TEST_NUMBER &   1 ->", TEST_NUMBER & 1);
console.log("TEST_NUMBER &&  0 ->", TEST_NUMBER && 0);
console.log("TEST_NUMBER &&  1 ->", TEST_NUMBER && 1);

console.log("TEST_BOOL &&  false ->", TEST_BOOL && false);
console.log("TEST_BOOL &&  true  ->", TEST_BOOL && true);
console.log("TEST_BOOL ||  false ->", TEST_BOOL || false);
console.log("TEST_BOOL ||  true  ->", TEST_BOOL || true);
console.log("!TEST_BOOL          ->", !TEST_BOOL);
