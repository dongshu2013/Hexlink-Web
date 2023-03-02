import { ethers, BigNumber as EthBigNumber } from "ethers";

import { isNativeCoin, isWrappedCoin } from "../../functions/common";
import type { Chain, BigNumberish } from "../../functions/common";
import { hexlinkSwap } from "../../functions/redpacket";
import { useRedPacketStore } from "@/stores/redpacket";
import { useChainStore } from '@/stores/chain';
import { httpsCallable } from 'firebase/functions'

const ALCHEMY_KEY = {
    "goerli": "U4LBbkMIAKCf4GpjXn7nB7H1_P9GiU4b",
    "polygon": "1GmfWOSlYIlUI0UcCu4Y2O-8DmFJrlqA",
    "mumbai": "Fj__UEjuIj0Xym6ofwZfJbehuuXGpDxe",
};

async function doSwitch(chain: Chain) {
    useRedPacketStore().reset();
    useChainStore().switchNetwork(chain);
}

export function alchemyKey(chain: Chain) : string {
    return (ALCHEMY_KEY as any)[chain.name] as string;
}

export async function switchNetwork(chain: Chain) {
    if (chain.name === useChainStore().chain?.name) {
        return;
    }
    doSwitch(chain);
}

export function getProvider(chain: Chain) {
    if (chain.name === "arbitrum_nova") {
        return new ethers.providers.JsonRpcProvider(
            {url: chain.rpcUrls[0]}
        );
    } else {
        return new ethers.providers.InfuraProvider(
            Number(chain.chainId),
            import.meta.env.VITE_INFURA_API_KEY
        );
    }
}

export async function getPriceInfo(chain: Chain, gasToken: string) : Promise<{
    gasPrice: BigNumberish,
    tokenPrice: BigNumberish
}> {
    const provider = getProvider(chain);
    const {maxFeePerGas} = await provider.getFeeData();
    let tokenPrice;
    if (isNativeCoin(gasToken, chain) || isWrappedCoin(gasToken, chain)) {
        tokenPrice = EthBigNumber.from(10).pow(18);
    } else {
        const swap = await hexlinkSwap(provider);
        tokenPrice = await swap.priceOf(gasToken);
    }
    return {gasPrice: maxFeePerGas.mul(2), tokenPrice}
}