import { publicClient, testClient } from "./_test/clients";
import { runIntegrationTests } from "./_test/constants";
import {
	addCollateralAndBorrow,
	addCollateralAndLeverage,
	repayAndRemoveCollateral,
} from "./cauldrons";
import { parseEther } from "viem";
import { describe, expect, test } from "vitest";

describe("addCollateralAndBorrow", () => {
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

	describe.skipIf(!runIntegrationTests)("integration", () => {
		test("should be able to borrow", async () => {
			const blockNumber = 17164936n;
			await testClient.reset({ blockNumber });

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
				add: {
					token: collateralTokenAddress,
					amount: parseEther(`${500_000}`), // 500_000n * 10n ** 18n,
				},
				borrow: {
					amount: parseEther(`${150_000}`),
				},
			});

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

describe("repayAndRemoveCollateral", () => {
	describe.skipIf(!runIntegrationTests)("integration", () => {
		test("should repay and remove collateral", async () => {
			const blockNumber = 17836605n;
			await testClient.reset({ blockNumber });

			const cauldronAddress = "0x7d8df3e4d06b0e19960c19ee673c0823beb90815";
			const collateralTokenAddress =
				"0xD533a949740bb3306d119CC777fa900bA034cd52";
			const userAddress = "0x7a16fF8270133F063aAb6C9977183D9e72835428";
			const mimAddress = "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3";
			const data = repayAndRemoveCollateral({
				from: userAddress,
				repay: {
					amount: parseEther(`${2_000_000}`),
					token: mimAddress,
				},
				remove: {
					token: collateralTokenAddress,
					amount: parseEther(`${8_000_000}`),
				},
			});

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

describe("addCollateralAndLeverage", () => {
	describe.skipIf(!runIntegrationTests)("integration", () => {
		test("should add collateral and leverage", async () => {
			const blockNumber = 13915559n;
			await testClient.reset({ blockNumber });
			await testClient.setNextBlockBaseFeePerGas({ baseFeePerGas: 0n });

			const cauldronAddress = "0xD8427794f8e9Af9bC0E027Eb9d4d3ee63b2491B3";
			const cauldronMasterContract =
				"0x476b1E35DDE474cB9Aa1f6B85c9Cc589BFa85c1F";
			const userAddress = "0xa6c5ea5b317875640990DaAa9cEeb60A6A0cbEc8";
			const swapperAddress = "0x205d52E9eA8E42659AC5C7F83863B18d27d7E0F5";
			const collateralAmount = parseEther(`${0.004}`);
			const data = addCollateralAndLeverage({
				from: userAddress,
				masterContractApproval: {
					user: userAddress,
					masterContract: cauldronMasterContract,
					approved: true,
					v: 27,
					r: "0x5681365058d7f724916f55d43c0a7c99d8362b49463eec0aa79ffa447203b920",
					s: "0x6d8b85284c705be22e034fa5f6e883d60d98326dafd1fd47f2b009eb1cdd114c",
				},
				add: {
					token: "ETH",
					amount: collateralAmount,
				},
				leverage: {
					kind: "ISwapper",
					amount: parseEther(`${10}`),
					swapper: swapperAddress,
					minToShare: parseEther(`${0.0025}`),
				},
			});
			const transactionHash = await testClient.sendUnsignedTransaction({
				from: userAddress,
				to: cauldronAddress,
				data,
				value: collateralAmount,
				maxFeePerGas: 0n,
				maxPriorityFeePerGas: 0n,
			});
			const { status } = await publicClient.waitForTransactionReceipt({
				hash: transactionHash,
			});
			expect(status).toBe("success");
		});
	});
});
