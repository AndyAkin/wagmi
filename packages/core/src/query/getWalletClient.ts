import { type QueryOptions } from '@tanstack/query-core'

import {
  type GetWalletClientError,
  type GetWalletClientParameters,
  type GetWalletClientReturnType,
  getWalletClient,
} from '../actions/getWalletClient.js'
import type { Config } from '../createConfig.js'
import type { Evaluate, ExactPartial } from '../types/utils.js'
import type { ScopeKeyParameter } from './types.js'
import { filterQueryOptions } from './utils.js'

export type GetWalletClientOptions<
  config extends Config,
  chainId extends config['chains'][number]['id'],
> = Evaluate<
  ExactPartial<GetWalletClientParameters<config, chainId>> & ScopeKeyParameter
>

export function getWalletClientQueryOptions<
  config extends Config,
  chainId extends config['chains'][number]['id'],
>(config: config, options: GetWalletClientOptions<config, chainId> = {}) {
  return {
    gcTime: 0,
    async queryFn({ queryKey }) {
      const { connector } = options
      const { connectorUid: _, scopeKey: _s, ...parameters } = queryKey[1]
      return getWalletClient(config, { ...parameters, connector })
    },
    queryKey: getWalletClientQueryKey(options),
  } as const satisfies QueryOptions<
    GetWalletClientQueryFnData<config, chainId>,
    GetWalletClientError,
    GetWalletClientData<config, chainId>,
    GetWalletClientQueryKey<config, chainId>
  >
}

export type GetWalletClientQueryFnData<
  config extends Config,
  chainId extends config['chains'][number]['id'],
> = GetWalletClientReturnType<config, chainId>

export type GetWalletClientData<
  config extends Config,
  chainId extends config['chains'][number]['id'],
> = GetWalletClientQueryFnData<config, chainId>

export function getWalletClientQueryKey<
  config extends Config,
  chainId extends config['chains'][number]['id'],
>(options: GetWalletClientOptions<config, chainId> = {}) {
  const { connector, ...parameters } = options
  return [
    'walletClient',
    { ...filterQueryOptions(parameters), connectorUid: connector?.uid },
  ] as const
}

export type GetWalletClientQueryKey<
  config extends Config,
  chainId extends config['chains'][number]['id'],
> = ReturnType<typeof getWalletClientQueryKey<config, chainId>>
