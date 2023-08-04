import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globalSetup: ["./src/_test/global-setup.ts"],
		setupFiles: ["./src/_test/setup.ts"],
		environment: "node",
		hookTimeout: 60_000,
		testTimeout: 60_000,
	},
});
