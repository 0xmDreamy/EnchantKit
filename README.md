# EnchantKit

An early stage (and unstable) API for interacting with Abracadabra's various product. Current it is only a POC!

The SDK uses [Viem](https://github.com/wagmi-dev/viem), and much of the repository setup is inspired by their setup! If something looks smart, you'll probably be able to find something similar there!

## Development

Feel free to contribute to the SDK by opening a PR or submitting issues.

### Prerequisites

- [PNPM](https://pnpm.io/installation)
- [Foundry](https://getfoundry.sh)

### Setup

1. `pnpm i`
2. `cp .env.example .env`
3. Update `.env` with appropriate values

### Test

To test the all packages run `pnpm test` in the root directory. It is also possible to run `pnpm test` in the various packages to test them individually. During development it might be useful run tests in watch mode with `pnpm test:dev` in the directory of the particular package.
