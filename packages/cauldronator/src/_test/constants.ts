export const rpcUrl = process.env.RPC_URL;
export const forkBlockNumber = 17164936n;

export const poolId = Number(process.env.VITEST_POOL_ID) ?? 1;
export const localHttpUrl = `http://127.0.0.1:8545/${poolId}`;
export const localWsUrl = `ws://127.0.0.1:8545/${poolId}`;