import { CAULDRON_V3_ABI } from "./contracts/cauldrons-v3";
import { SIMPLE_SWAP_ABI } from "./contracts/isimple-swap";
import { ISWAPPER_ABI } from "./contracts/iswapper";
import {
	ADD_COLLATERAL_ACTION,
	Action,
	BENTOBOX_DEPOSIT_ACTION,
	BENTOBOX_SET_APPROVAL_ACTION,
	BENTOBOX_WITHDRAW_ACTION,
	BORROW_ACTION,
	CALL_ACTION,
	GET_REPAY_PART_ACTION,
	REMOVE_COLLATERAL_ACTION,
	REPAY_ACTION,
	USE_ETHEREUM,
	USE_VALUE_1,
	USE_VALUE_2,
	createAction,
} from "cooker";
import _ from "lodash";
import { RequireAtLeastOne, SetOptional, TaggedUnion } from "type-fest";
import { Address, Hex, encodeAbiParameters, encodeFunctionData } from "viem";

export type CauldronVersion = "V1" | "V2" | "V3" | "V4";
export type Swapper = {
	address: Address;
	kind: SwapperKind;
};
export type SwapperKind = "ISwapperWithExact" | "ILevSwapperV2" | "ISwapper";

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

export type AddCollateralParameters = {
	token: Address | "ETH";
	amount: bigint;
	from: Address;
};

export type BorrowParameters = {
	amount: bigint;
	to: Address;
};

export type AddCollateralAndBorrowParameters = RequireAtLeastOne<
	{
		from: Address;
		masterContractApproval?: MasterContractApprovalParameters;
		add?: Omit<AddCollateralParameters, "from">;
		borrow?: SetOptional<BorrowParameters, "to">;
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
		actions.push(masterContractApprovalAction(masterContractApproval));
	}
	if (add !== undefined) {
		actions.push(...addCollateralActions({ ...add, from }));
	}
	if (borrow !== undefined) {
		// If the only action is bororw, just call the contract directly
		if (actions.length === 0) {
			const { amount, to } = borrow;
			return encodeFunctionData({
				abi: CAULDRON_V3_ABI,
				functionName: "borrow",
				args: [to ?? from, amount],
			});
		} else {
			actions.push(borrowAction({ to: from, ...borrow }));
		}
	}

	return encodeFunctionData({
		abi: CAULDRON_V3_ABI,
		functionName: "cook",
		args: _.unzip(actions) as [number[], bigint[], Hex[]],
	});
}

export type RepayParameters = {
	token: Address;
	amount: bigint;
	from: Address;
	to?: Address;
};

export type RemoveCollateralParameters = {
	token: Address | "ETH";
	amount: bigint;
	from: Address;
	to?: Address;
};

export type RepayAndRemoveCollateralParameters = RequireAtLeastOne<
	{
		from: Address;
		masterContractApproval?: MasterContractApprovalParameters;
		repay?: Omit<RepayParameters, "from">;
		remove?: Omit<RemoveCollateralParameters, "from">;
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
		actions.push(masterContractApprovalAction(masterContractApproval));
	}
	if (repay !== undefined) {
		actions.push(...repayActions({ ...repay, from }));
	}
	if (remove !== undefined) {
		actions.push(...removeCollateralActions({ ...remove, from }));
	}

	return encodeFunctionData({
		abi: CAULDRON_V3_ABI,
		functionName: "cook",
		args: _.unzip(actions) as [number[], bigint[], Hex[]],
	});
}

export type LeverageParameters = {
	to: Address;
	amount: bigint;
	swapper: Address;
} & (
	| {
			kind: "ISwapperWithExact";
	  }
	| {
			kind: "ILevSwapperV2";
	  }
	| { kind: "ISwapper"; minToShare: bigint }
);

export type AddCollateralAndLeverageParameters = {
	from: Address;
	masterContractApproval?: MasterContractApprovalParameters;
	add?: Omit<AddCollateralParameters, "from">;
	leverage?: SetOptional<LeverageParameters, "to">;
};

export function addCollateralAndLeverage({
	from,
	masterContractApproval,
	add,
	leverage,
}: AddCollateralAndLeverageParameters): Hex {
	const actions: Action[] = [];

	if (masterContractApproval !== undefined) {
		actions.push(masterContractApprovalAction(masterContractApproval));
	}
	if (add !== undefined) {
		actions.push(...addCollateralActions({ ...add, from }));
	}
	if (leverage !== undefined) {
		actions.push(...leverageActions({ to: from, ...leverage }));
	}

	return encodeFunctionData({
		abi: CAULDRON_V3_ABI,
		functionName: "cook",
		args: _.unzip(actions) as [number[], bigint[], Hex[]],
	});
}

function masterContractApprovalAction({
	user,
	masterContract,
	approved,
	v,
	r,
	s,
}: MasterContractApprovalParameters): Action {
	return createAction({
		...BENTOBOX_SET_APPROVAL_ACTION,
		parameters: [user, masterContract, approved, v, r, s],
	});
}

function addCollateralActions({
	token,
	amount,
	from,
}: AddCollateralParameters): Action[] {
	const actions: Action[] = [];

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

	return actions;
}

function borrowAction({ amount, to }: BorrowParameters): Action {
	return createAction({
		...BORROW_ACTION,
		value: 0n,
		parameters: [amount, to],
	});
}

function repayActions({ token, amount, from, to }: RepayParameters): Action[] {
	const actions: Action[] = [];

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

	return actions;
}

function removeCollateralActions({
	amount,
	token,
	from,
	to,
}: RemoveCollateralParameters): Action[] {
	const actions: Action[] = [];

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

	return actions;
}

function leverageActions(params: LeverageParameters): Action[] {
	const actions: Action[] = [];
	const { to, amount, swapper } = params;

	actions.push(borrowAction({ amount, to: swapper }));

	let callData: Hex;
	switch (params.kind) {
		case "ISwapper": {
			const { minToShare } = params;
			callData = encodeAbiParameters(SIMPLE_SWAP_ABI[0].inputs.slice(0, -1), [
				to,
				minToShare,
			]);
			break;
		}
		// TODO: HANDLE the remaining swappers!
		default:
			callData = "0x";
	}
	const swapAction = createAction({
		...CALL_ACTION,
		value: 0n,
		parameters: [params.swapper, callData, false, true, 2],
	});
	actions.push(swapAction);

	const addCollateralAction = createAction({
		...ADD_COLLATERAL_ACTION,
		value: 0n,
		parameters: [USE_VALUE_2, to, false],
	});
	actions.push(addCollateralAction);

	return actions;
}
