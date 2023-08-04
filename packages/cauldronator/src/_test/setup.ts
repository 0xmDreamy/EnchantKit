import { testClient } from "./clients";
import { forkBlockNumber, poolId, rpcUrl } from "./constants";
import { fetchLogs } from "@viem/anvil";
import { afterAll, afterEach, vi } from "vitest";

afterAll(async () => {
	vi.restoreAllMocks();
	await testClient.reset({
		jsonRpcUrl: rpcUrl,
		blockNumber: forkBlockNumber,
	});
});

afterEach((context) => {
	// Print the last log entries from anvil after each test.
	context.onTestFailed(async (result) => {
		try {
			const response = await fetchLogs("http://127.0.0.1:8545", poolId);
			const logs = response.slice(-20);

			if (logs.length === 0) {
				return;
			}

			// Try to append the log messages to the vitest error message if possible. Otherwise, print them to the console.
			const error = result.errors?.[0];

			if (error !== undefined) {
				error.message +=
					"\n\nAnvil log output\n=======================================\n";
				error.message += `\n${logs.join("\n")}`;
			} else {
				console.log(...logs);
			}
		} catch {}
	});
});
