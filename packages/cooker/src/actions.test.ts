import { REPAY_ACTION, createAction } from "./actions";
import { expect, it, test } from "vitest";

test("createAction", () => {
	it("repay", () => {
		const [action, value, data] = createAction({
			...REPAY_ACTION,
			value: 0n,
			parameters: [1000n, "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5", false],
		});
		expect(action).toBe(2);
		expect(value).toBe(0n);
		expect(data).toBe(
			"0x00000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000dafea492d9c6733ae3d56b7ed1adb60692c98bc50000000000000000000000000000000000000000000000000000000000000000",
		);
	});
});
