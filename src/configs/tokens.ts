import type { Network, TokenDataList, Token } from "@/types";
import GOERLI_TOKENS from "@/configs/tokens/GOERLI_TOKENS.json";
import MUMBAI_TOKENS from "@/configs/tokens/MUMBAI_TOKENS.json";
import POLYGON_TOEKNS from"@/configs/tokens/POLYGON_TOKENS.json";
import { useNetworkStore } from '@/stores/network';
import CONTRACTS from "@/configs/contracts.json";

const POLYGON_POPULAR_TOKENS = "https://api-polygon-tokens.polygon.technology/tokenlists/popularTokens.tokenlist.json";

export function nativeCoinAddress(network: Network) {
    if (network.chainId == 137) {
        return "0x0000000000000000000000000000000000001010";
    }
    return "0x0000000000000000000000000000000000000000";
}

export function wrappedCoinAddress(network: Network) {
    return (CONTRACTS as any)[network.name].wrappedCoin;
}

export async function getPopularTokens(network: Network) : Promise<TokenDataList> {
    if (network.chainId == 137) {
        // const response = await fetch(POLYGON_POPULAR_TOKENS);
        // return await response.json();
        return {
            timestamp: new Date().toISOString(),
            tokens: POLYGON_TOEKNS,
        }
    }
    if (network.chainId == 5) {
        return {
            timestamp: new Date().toISOString(),
            tokens: GOERLI_TOKENS,
        }
    }
    if (network.chainId == 80001) {
        return {
            timestamp: new Date().toISOString(),
            tokens: MUMBAI_TOKENS,
        }
    }
    return {
        tokens: [],
        timestamp: new Date().toDateString(),
        error: "Unsupported network " + network.chainId
    };
}

export function isNativeCoin(token: Token) {
    const nativeCoin = useNetworkStore().nativeCoinAddress;
    const tokenAddr = token.metadata.address;
    return tokenAddr.toLowerCase() == nativeCoin.toLowerCase();
}

export function isWrappedCoin(token: Token) {
    const wrappeCoin = useNetworkStore().nativeCoinAddress;
    const tokenAddr = token.metadata.address;
    return tokenAddr.toLowerCase() == wrappeCoin.toLowerCase();
}