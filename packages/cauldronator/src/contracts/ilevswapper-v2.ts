export const ILEVSWAPPER_V2_ABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "recipient",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "shareToMin",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "shareFrom",
				type: "uint256",
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes",
			},
		],
		name: "swap",
		outputs: [
			{
				internalType: "uint256",
				name: "extraShare",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "shareReturned",
				type: "uint256",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;
