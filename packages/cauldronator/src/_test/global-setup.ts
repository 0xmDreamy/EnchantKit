import { forkBlockNumber, rpcUrl, runIntegrationTests } from "./constants";
import { startProxy } from "@viem/anvil";

export default () => {
	if (runIntegrationTests) {
		startProxy({
			options: {
				forkUrl: rpcUrl,
				forkBlockNumber,
			},
		});
	}
};
