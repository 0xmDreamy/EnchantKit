import { forkBlockNumber, rpcUrl } from "./constants";
import { startProxy } from "@viem/anvil";

export default () =>
	startProxy({
		options: {
			forkUrl: rpcUrl,
			forkBlockNumber,
		},
	});
