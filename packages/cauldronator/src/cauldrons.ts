import { CAULDRON_V3_ABI } from "./contracts/cauldrons-v3";
import {
	ADD_COLLATERAL_ACTION,
	Action,
	BENTOBOX_DEPOSIT_ACTION,
	BENTOBOX_SET_APPROVAL_ACTION,
	BENTOBOX_WITHDRAW_ACTION,
	BORROW_ACTION,
	GET_REPAY_PART_ACTION,
	REMOVE_COLLATERAL_ACTION,
	REPAY_ACTION,
	USE_ETHEREUM,
	USE_VALUE_1,
	USE_VALUE_2,
	createAction,
} from "cooker";
import _ from "lodash";
import { RequireAtLeastOne } from "type-fest";
import { Address, Hex, encodeFunctionData } from "viem";

export type CauldronVersion = "V1" | "V2" | "V3" | "V4";
export type Swapper = {
	address: Address;
	kind: "ISwapperWithExact" | "ILevSwapperV2" | "ISwapper";
};

export type Cauldron = {
	name: string;
	chainId: number;
	id: number;
	contract: {
		address: Address;
		kind: CauldronVersion;
	};
	leverageSwapper: Swapper;
	deleverageSwapper: Swapper;
};

const USDT_STARGATE_CAULDRON: Cauldron = {
	name: "Stargate USDT",
	chainId: 1,
	id: 32,
	contract: {
		address: "0xc6B2b3fE7c3D7a6f823D9106E22e66660709001e",
		kind: "V3",
	},
	leverageSwapper: {
		address: "0x1E188DD74adf8CC95c98714407e88a4a99b759A5",
		kind: "ILevSwapperV2",
	},
	deleverageSwapper: {
		address: "0x8e266f8310E047B9900b60132E4767FfDD0878bC",
		kind: "ILevSwapperV2",
	},
} as const;

export const CAULDRONS = [USDT_STARGATE_CAULDRON] as const;

export type MasterContractApprovalParameters = {
	user: Address;
	masterContract: Address;
	approved: boolean;
	v: number;
	r: Hex;
	s: Hex;
};

export type AddCollateralAndBorrowParameters = RequireAtLeastOne<
	{
		from: Address;
		masterContractApproval?: MasterContractApprovalParameters;
		add?: {
			token: Address | "ETH";
			amount: bigint;
		};
		borrow?: {
			amount: bigint;
			to?: Address;
		};
	},
	"masterContractApproval" | "add" | "borrow"
>;

export function addCollateralAndBorrow({
	from,
	masterContractApproval,
	add,
	borrow,
}: AddCollateralAndBorrowParameters): Hex {
	const actions: Action[] = [];
	if (masterContractApproval !== undefined) {
		const { user, masterContract, approved, v, r, s } = masterContractApproval;

		const action = createAction({
			...BENTOBOX_SET_APPROVAL_ACTION,
			parameters: [user, masterContract, approved, v, r, s],
		});
		actions.push(action);
	}

	if (add !== undefined) {
		const { token, amount } = add;

		let depositAction;
		if (token === "ETH") {
			depositAction = createAction({
				...BENTOBOX_DEPOSIT_ACTION,
				value: amount,
				parameters: [USE_ETHEREUM, from, amount, 0n],
			});
		} else {
			depositAction = createAction({
				...BENTOBOX_DEPOSIT_ACTION,
				value: 0n,
				parameters: [token, from, amount, 0n],
			});
		}
		actions.push(depositAction);

		const addCollateralAction = createAction({
			...ADD_COLLATERAL_ACTION,
			value: 0n,
			parameters: [USE_VALUE_2, from, false],
		});

		actions.push(addCollateralAction);
	}

	if (borrow !== undefined) {
		const { amount, to } = borrow;

		if (actions.length === 0) {
			return encodeFunctionData({
				abi: CAULDRON_V3_ABI,
				functionName: "borrow",
				args: [to ?? from, amount],
			});
		} else {
			const action = createAction({
				...BORROW_ACTION,
				value: 0n,
				parameters: [amount, to ?? from],
			});
			actions.push(action);
		}
	}
	return encodeFunctionData({
		abi: CAULDRON_V3_ABI,
		functionName: "cook",
		args: _.unzip(actions) as [number[], bigint[], Hex[]],
	});
}

export type RepayAndRemoveCollateralParameters = RequireAtLeastOne<
	{
		from: Address;
		masterContractApproval?: MasterContractApprovalParameters;
		repay?: {
			token: Address;
			amount: bigint;
			to?: Address;
		};
		remove?: {
			token: Address | "ETH";
			amount: bigint;
			to?: Address;
		};
	},
	"masterContractApproval" | "repay" | "remove"
>;

export function repayAndRemoveCollateral({
	from,
	masterContractApproval,
	repay,
	remove,
}: RepayAndRemoveCollateralParameters): Hex {
	const actions: Action[] = [];
	if (masterContractApproval !== undefined) {
		const { user, masterContract, approved, v, r, s } = masterContractApproval;

		const action = createAction({
			...BENTOBOX_SET_APPROVAL_ACTION,
			parameters: [user, masterContract, approved, v, r, s],
		});
		actions.push(action);
	}

	if (repay !== undefined) {
		const { token, amount, to } = repay;

		const depositAction = createAction({
			...BENTOBOX_DEPOSIT_ACTION,
			value: 0n,
			parameters: [token, from, amount, 0n],
		});
		actions.push(depositAction);

		const getRepayPartAction = createAction({
			...GET_REPAY_PART_ACTION,
			parameters: [amount],
		});
		actions.push(getRepayPartAction);

		const repayAction = createAction({
			...REPAY_ACTION,
			value: 0n,
			parameters: [USE_VALUE_1, to ?? from, false],
		});

		actions.push(repayAction);
	}

	if (remove !== undefined) {
		const { amount, token, to } = remove;

		const removeCollateralAction = createAction({
			...REMOVE_COLLATERAL_ACTION,
			parameters: [amount, from],
		});
		actions.push(removeCollateralAction);

		const withdrawAction = createAction({
			...BENTOBOX_WITHDRAW_ACTION,
			parameters: [
				token === "ETH" ? USE_ETHEREUM : token,
				to ?? from,
				amount,
				0n,
			],
		});
		actions.push(withdrawAction);
	}

	return encodeFunctionData({
		abi: CAULDRON_V3_ABI,
		functionName: "cook",
		args: _.unzip(actions) as [number[], bigint[], Hex[]],
	});
}

// export type AddCollateralAndLeverageParameters = {
// 	from: Address;
// 	masterContractApproval?: MasterContractApprovalParameters;
// 	collateral?: AddCollateralParameters;
// };
//
// function addCollateralAndLeverage({
// 	from,
// 	masterContractApproval,
// 	collateral,
// }: AddCollateralAndLeverageParameters) /*: Hex | null*/ {
// 	const indicies: number[] = [];
// 	const values: bigint[] = [];
// 	const datas: Hex[] = [];
// }
