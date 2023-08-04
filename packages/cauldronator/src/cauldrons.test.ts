import { publicClient, testClient } from "./_test/clients";
import { addCollateralAndBorrow } from "./cauldrons";
import { isNull } from "lodash";
import { describe, expect, test } from "vitest";

describe("addCollateralAndBorrow", () => {
	test("should return null if there is no action", () => {
		const data = addCollateralAndBorrow({
			from: "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5",
		});
		expect(data).toBeNull();
	});

	test("should return data direct borrow call", () => {
		const data = addCollateralAndBorrow({
			from: "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5",
			borrow: {
				to: "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5",
				amount: 1000n,
			},
		});
		expect(data).toBe(
			"0x4b8a3529000000000000000000000000dafea492d9c6733ae3d56b7ed1adb60692c98bc500000000000000000000000000000000000000000000000000000000000003e8",
		);
	});

	describe("integration", () => {
		test("should be able to borrow", async () => {
			const cauldronAddress = "0x7d8df3e4d06b0e19960c19ee673c0823beb90815";
			const cauldronMasterContract =
				"0xC4113Ae18E0d3213c6a06947a2fFC70AD3517c77";
			const collateralTokenAddress =
				"0xD533a949740bb3306d119CC777fa900bA034cd52";
			const userAddress = "0x7a16fF8270133F063aAb6C9977183D9e72835428";

			const data = addCollateralAndBorrow({
				from: userAddress,
				masterContractApproval: {
					user: userAddress,
					masterContract: cauldronMasterContract,
					approved: true,
					v: 28,
					r: "0x2ee8eb97b65318067f4f46f635d79b9ba582e9b56e949106c5f21788f8177934",
					s: "0x773474f856b66646895baa69d3227b0267e5a17e1a2b54d3e6e123427f419a36",
				},
				collateral: {
					token: collateralTokenAddress,
					amount: 500_000n * 10n ** 18n,
				},
				borrow: {
					amount: 150_000n * 10n ** 18n,
				},
			});
			if (isNull(data)) {
				throw "addCollateralAndBorrow data was null";
			}
			const transactionHash = await testClient.sendUnsignedTransaction({
				from: userAddress,
				to: cauldronAddress,
				data,
			});
			const { status } = await publicClient.waitForTransactionReceipt({
				hash: transactionHash,
			});
			expect(status).toBe("success");
		});
	});
});
