import { localWsUrl } from "./constants";
import { createPublicClient, createTestClient, webSocket } from "viem";

export const publicClient = createPublicClient({
	transport: webSocket(localWsUrl),
});

export const testClient = createTestClient({
	mode: "anvil",
	transport: webSocket(localWsUrl),
});
