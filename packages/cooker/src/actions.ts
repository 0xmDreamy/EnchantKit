import { AbiParameter, AbiParametersToPrimitiveTypes } from "abitype";
import { Hex, encodeAbiParameters } from "viem";

export type CauldronVersion = "V1" | "V2" | "V3" | "V4";

export type ActionDescription<TParams extends readonly AbiParameter[] = []> = {
	readonly abi: TParams;
	readonly kind: string;
	readonly value?: bigint;
	readonly index: number;
	readonly cauldron: CauldronVersion;
};

export const USE_ETHEREUM = "0x0000000000000000000000000000000000000000";
export const USE_VALUE_1 = -1n;
export const USE_VALUE_2 = -2n;

export type CreateActionParameters<TParams extends readonly AbiParameter[]> =
	ActionDescription<TParams> & {
		value: bigint;
		parameters: TParams extends readonly AbiParameter[]
			? AbiParametersToPrimitiveTypes<TParams>
			: never;
	};

export type Action = [number, bigint, Hex];

export function createAction<TParams extends readonly AbiParameter[]>({
	index,
	value,
	abi,
	parameters,
}: CreateActionParameters<TParams>): Action {
	if (parameters !== undefined) {
		return [index, value, encodeAbiParameters(abi, parameters)];
	} else {
		return [index, value, "0x"];
	}
}

export const REPAY_PARAMETERS_ABI = [
	{ name: "part", type: "int256" },
	{ name: "to", type: "address" },
	{ name: "skim", type: "bool" },
] as const satisfies readonly AbiParameter[];

export const REPAY_ACTION = {
	abi: REPAY_PARAMETERS_ABI,
	kind: "ACTION_REPAY",
	index: 2,
	cauldron: "V1",
	value: 0n,
} as const satisfies ActionDescription<typeof REPAY_PARAMETERS_ABI>;

export const REMOVE_COLLATERAL_PARAMETERS_ABI = [
	{ name: "share", type: "int256" },
	{ name: "to", type: "address" },
] as const satisfies readonly AbiParameter[];

export const REMOVE_COLLATERAL_ACTION = {
	abi: REMOVE_COLLATERAL_PARAMETERS_ABI,
	kind: "REMOVE_COLLATERAL_PARAMETERS",
	index: 4,
	cauldron: "V1",
	value: 0n,
} as const satisfies ActionDescription<typeof REMOVE_COLLATERAL_PARAMETERS_ABI>;

export const BORROW_PARAMETERS_ABI = [
	{ name: "amount", type: "int256" },
	{ name: "to", type: "address" },
] as const satisfies readonly AbiParameter[];

export const BORROW_ACTION = {
	abi: BORROW_PARAMETERS_ABI,
	kind: "ACTION_BORROW",
	index: 5,
	cauldron: "V1",
	value: 0n,
} as const satisfies ActionDescription<typeof BORROW_PARAMETERS_ABI>;

export const GET_REPAY_SHARE_PARAMETERS_ABI = [
	{ name: "part", type: "uint256" },
] as const satisfies readonly AbiParameter[];

export const GET_REPAY_SHARE_ACTION = {
	abi: GET_REPAY_SHARE_PARAMETERS_ABI,
	kind: "ACTION_GET_REPAY_SHARE",
	index: 6,
	cauldron: "V1",
	value: 0n,
} as const satisfies ActionDescription<typeof GET_REPAY_SHARE_PARAMETERS_ABI>;

export const GET_REPAY_PART_PARAMETERS_ABI = [
	{ name: "amount", type: "uint256" },
] as const satisfies readonly AbiParameter[];

export const GET_REPAY_PART_ACTION = {
	abi: GET_REPAY_PART_PARAMETERS_ABI,
	kind: "ACTION_GET_REPAY_PART",
	index: 7,
	cauldron: "V1",
	value: 0n,
} as const satisfies ActionDescription<typeof GET_REPAY_PART_PARAMETERS_ABI>;

export const ADD_COLLATERAL_PARAMETERS_ABI = [
	{ name: "share", type: "int256" },
	{ name: "to", type: "address" },
	{ name: "skim", type: "bool" },
] as const satisfies readonly AbiParameter[];

export const ADD_COLLATERAL_ACTION = {
	abi: ADD_COLLATERAL_PARAMETERS_ABI,
	kind: "ACTION_ADD_COLLATERAL",
	index: 10,
	cauldron: "V1",
	value: 0n,
} as const satisfies ActionDescription<typeof ADD_COLLATERAL_PARAMETERS_ABI>;

export const UPDATE_EXCHANGE_RATE_PARAMETERS_ABI = [
	{ name: "mustUpdate", type: "bool" },
	{ name: "minRate", type: "uint256" },
	{ name: "maxRate", type: "uint256" },
] as const satisfies readonly AbiParameter[];

export const UPDATE_EXCHANGE_RATE_ACTION = {
	abi: UPDATE_EXCHANGE_RATE_PARAMETERS_ABI,
	kind: "ACTION_UPDATE_EXCHANGE_RATE",
	index: 11,
	cauldron: "V1",
	value: 0n,
} as const satisfies ActionDescription<
	typeof UPDATE_EXCHANGE_RATE_PARAMETERS_ABI
>;

export const BENTOBOX_DEPOSIT_PARAMETERS_ABI = [
	{ name: "token", type: "address" },
	{ name: "to", type: "address" },
	{ name: "amount", type: "uint256" },
	{ name: "share", type: "uint256" },
] as const satisfies readonly AbiParameter[];

export const BENTOBOX_DEPOSIT_ACTION: ActionDescription<
	typeof BENTOBOX_DEPOSIT_PARAMETERS_ABI
> = {
	abi: BENTOBOX_DEPOSIT_PARAMETERS_ABI,
	kind: "ACTION_BENTO_DEPOSIT",
	index: 20,
	cauldron: "V1",
} as const satisfies ActionDescription<typeof BENTOBOX_DEPOSIT_PARAMETERS_ABI>;

export const BENTOBOX_WITHDRAW_PARAMETERS_ABI = [
	{ name: "token", type: "address" },
	{ name: "to", type: "address" },
	{ name: "amount", type: "uint256" },
	{ name: "share", type: "uint256" },
] as const satisfies readonly AbiParameter[];

export const BENTOBOX_WITHDRAW_ACTION = {
	abi: BENTOBOX_WITHDRAW_PARAMETERS_ABI,
	kind: "ACTION_BENTO_WITHDRAW",
	index: 21,
	cauldron: "V1",
} as const satisfies ActionDescription<typeof BENTOBOX_WITHDRAW_PARAMETERS_ABI>;

export const BENTOBOX_TRANSFER_PARAMETERS_ABI = [
	{ name: "token", type: "address" },
	{ name: "to", type: "address" },
	{ name: "share", type: "int256" },
] as const satisfies readonly AbiParameter[];

export const BENTOBOX_TRANSFER_ACTION: ActionDescription<
	typeof BENTOBOX_TRANSFER_PARAMETERS_ABI
> = {
	abi: BENTOBOX_TRANSFER_PARAMETERS_ABI,
	kind: "ACTION_BENTO_TRANSFER",
	index: 22,
	cauldron: "V1",
} as const satisfies ActionDescription<typeof BENTOBOX_TRANSFER_PARAMETERS_ABI>;

export const BENTOBOX_TRANSFER_MULTIPLE_PARAMETERS_ABI = [
	{ name: "token", type: "address" },
	{ name: "tos", type: "address[]" },
	{ name: "share", type: "uint256[]" },
] as const satisfies readonly AbiParameter[];

export const BENTOBOX_TRANSFER_MULTIPLE_ACTION: ActionDescription<
	typeof BENTOBOX_TRANSFER_MULTIPLE_PARAMETERS_ABI
> = {
	abi: BENTOBOX_TRANSFER_MULTIPLE_PARAMETERS_ABI,
	kind: "ACTION_BENTO_TRANSFER_MULTIPLE",
	index: 23,
	cauldron: "V1",
} as const satisfies ActionDescription<
	typeof BENTOBOX_TRANSFER_MULTIPLE_PARAMETERS_ABI
>;

export const BENTOBOX_SET_APPROVAL_PARAMETERS_ABI = [
	{ name: "user", type: "address" },
	{ name: "masterContract", type: "address" },
	{ name: "approved", type: "bool" },
	{ name: "v", type: "uint8" },
	{ name: "r", type: "bytes32" },
	{ name: "s", type: "bytes32" },
] as const satisfies readonly AbiParameter[];

export const BENTOBOX_SET_APPROVAL_ACTION = {
	abi: BENTOBOX_SET_APPROVAL_PARAMETERS_ABI,
	kind: "ACTION_BENTO_SETAPPROVAL",
	index: 24,
	value: 0n,
	cauldron: "V1",
} as const satisfies ActionDescription<
	typeof BENTOBOX_SET_APPROVAL_PARAMETERS_ABI
>;

export const CALL_PARAMETERS_ABI = [
	{ name: "callee", type: "address" },
	{ name: "callData", type: "bytes" },
	{ name: "useValue1", type: "bool" },
	{ name: "useValue2", type: "bool" },
	{ name: "returnValues", type: "uint8" },
] as const satisfies readonly AbiParameter[];

export const CALL_ACTION: ActionDescription<typeof CALL_PARAMETERS_ABI> = {
	abi: CALL_PARAMETERS_ABI,
	kind: "ACTION_CALL",
	index: 30,
	cauldron: "V1",
} as const satisfies ActionDescription<typeof CALL_PARAMETERS_ABI>;

const LIQUIDATE_PARAMETERS_ABI = [
	{ name: "users", type: "address[]" },
	{ name: "maxBorrowParts", type: "uint256[]" },
	{ name: "to", type: "address" },
	{ name: "swapper", type: "address" },
	{ name: "swapperData", type: "bytes" },
] as const satisfies readonly AbiParameter[];

export const LIQUIDATE_ACTION: ActionDescription<
	typeof LIQUIDATE_PARAMETERS_ABI
> = {
	abi: LIQUIDATE_PARAMETERS_ABI,
	kind: "ACTION_LIQUIDATE",
	index: 31,
	cauldron: "V4",
} as const satisfies ActionDescription<typeof LIQUIDATE_PARAMETERS_ABI>;

const RELEASE_COLLATERAL_FROM_STRATEGY_PARAMETERS_ABI =
	[] as const satisfies readonly AbiParameter[];

export const RELEASE_COLLATERAL_FROM_STRATEGY_ACTION: ActionDescription<
	typeof RELEASE_COLLATERAL_FROM_STRATEGY_PARAMETERS_ABI
> = {
	abi: RELEASE_COLLATERAL_FROM_STRATEGY_PARAMETERS_ABI,
	kind: "ACTION_RELEASE_COLLATERAL_FROM_STRATEGY",
	index: 32,
	cauldron: "V4",
} as const satisfies ActionDescription<
	typeof RELEASE_COLLATERAL_FROM_STRATEGY_PARAMETERS_ABI
>;
