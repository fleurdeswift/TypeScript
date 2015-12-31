const TEST_NUMBER = 1;
const TEST_BOOL = true;

function log(...args: any[]) {
}

log("TEST_NUMBER <   1 ->", TEST_NUMBER < 1);
log("TEST_NUMBER <=  1 ->", TEST_NUMBER <= 1);
log("TEST_NUMBER >   1 ->", TEST_NUMBER > 1);
log("TEST_NUMBER >=  1 ->", TEST_NUMBER >= 1);
log("TEST_NUMBER ==  1 ->", TEST_NUMBER == 1);
log("TEST_NUMBER === 1 ->", TEST_NUMBER === 1);
log("TEST_NUMBER |   0 ->", TEST_NUMBER | 0);
log("TEST_NUMBER |   1 ->", TEST_NUMBER | 1);
log("TEST_NUMBER |   2 ->", TEST_NUMBER | 2);
log("TEST_NUMBER ||  0 ->", TEST_NUMBER || 0);
log("TEST_NUMBER ||  1 ->", TEST_NUMBER || 1);
log("TEST_NUMBER &   0 ->", TEST_NUMBER & 0);
log("TEST_NUMBER &   1 ->", TEST_NUMBER & 1);
log("TEST_NUMBER &&  0 ->", TEST_NUMBER && 0);
log("TEST_NUMBER &&  1 ->", TEST_NUMBER && 1);

log("TEST_BOOL &&  false ->", TEST_BOOL && false);
log("TEST_BOOL &&  true  ->", TEST_BOOL && true);
log("TEST_BOOL ||  false ->", TEST_BOOL || false);
log("TEST_BOOL ||  true  ->", TEST_BOOL || true);
log("!TEST_BOOL          ->", !TEST_BOOL);
