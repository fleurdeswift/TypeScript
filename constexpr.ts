
declare constexpr __FILE__: string;
declare constexpr __LINE__: number;
declare constexpr __FUNCTION__: string; // ie: "namespace.assert"
declare constexpr __FUNCTION_NAME__: string; // ie: "assert"
declare constexpr __ARGUMENTS_NAMES__: string[]; // ie: ["arg1", "arg2"]
declare constexpr __ARGUMENTS__: {[key: string]: any]}; // ie: {"arg1": arg1, "arg2": arg2}
declare constexpr DEBUG: boolean;
constexpr i = 1;

constexpr function assert(v: any, message: string = __LITERAL__v, fileName: string = __FILE__, lineNumber: number = __LINE__) {
	if (DEBUG && !v) {
		throw new Error(`Assertion failed: ${message} at ${fileName}:@{number}`);
	}
}

function test(v: number) {
	assert(v);
}

test(undefined);
