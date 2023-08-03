import { accounts, chain, config, testConnector } from '@wagmi/test'
import { expect, test } from 'vitest'

import { connect } from './connect.js'
import { disconnect } from './disconnect.js'
import { getAccount } from './getAccount.js'
import { switchChain } from './switchChain.js'

const connector = config.connectors[0]!

test('default', async () => {
  await connect(config, { connector })

  const chainId1 = getAccount(config).chainId

  await switchChain(config, { chainId: chain.mainnet2.id })

  const chainId2 = getAccount(config).chainId
  expect(chainId2).toBeDefined()
  expect(chainId1).not.toBe(chainId2)

  await switchChain(config, { chainId: chain.mainnet.id })

  const chainId3 = getAccount(config).chainId
  expect(chainId3).toBeDefined()
  expect(chainId1).toBe(chainId3)

  await disconnect(config, { connector })
})

test('behavior: user rejected request', async () => {
  const connector_ = config._internal.setup(
    testConnector({
      accounts,
      features: { switchChainError: true },
    }),
  )
  await connect(config, { connector: connector_ })
  await expect(
    switchChain(config, { chainId: chain.mainnet.id }),
  ).rejects.toMatchInlineSnapshot(`
    [UserRejectedRequestError: User rejected the request.

    Details: Failed to switch chain.
    Version: viem@0.0.0-w-20230802141753]
  `)
  await disconnect(config, { connector: connector_ })
})

test('behavior: not supported', async () => {
  const { switchChain: _, ...connector_ } = config._internal.setup(
    testConnector({ accounts }),
  )
  await connect(config, { connector: connector_ })
  await expect(
    switchChain(config, { chainId: chain.mainnet.id }),
  ).rejects.toMatchInlineSnapshot(`
    [SwitchChainNotSupportedError: "Test Connector" does not support programmatic chain switching.

    Version: @wagmi/core@x.y.z]
  `)
  await disconnect(config, { connector: connector_ })
})

test('behavior: not connected', async () => {
  const chainId = config.state.chainId
  expect(config.state.chainId).toMatchInlineSnapshot('123')
  await switchChain(config, { chainId: chain.mainnet2.id })
  expect(config.state.chainId).toMatchInlineSnapshot('456')
  await switchChain(config, { chainId })
  expect(config.state.chainId).toMatchInlineSnapshot('123')
})
