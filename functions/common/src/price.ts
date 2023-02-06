import { BigNumber } from "bignumber.js";
import { Chain } from "./chain";
import { isNativeCoin, isStableCoin, isWrappedCoin } from "./tokens";
import { BigNumber as EthBigNumber } from "ethers";
import {toEthBigNumber} from "./utils";

export interface PriceConfig {
    nativeCurrencyInUsd: string,
    defaultGasPrice: string,
}

export interface PriceInfo extends PriceConfig {
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    lastBaseFeePerGas: string;
}

const GOERLI : PriceConfig = {
    nativeCurrencyInUsd: "1500.0",
    defaultGasPrice: "10000000000", // 10 gwei
};

const POLYGON : PriceConfig = {
    nativeCurrencyInUsd: "1.0",
    defaultGasPrice: "100000000000", // 100 gwei
};

const MUMBAI : PriceConfig = {
    nativeCurrencyInUsd: "1.0",
    defaultGasPrice: "2000000000", // 2 gwei
};

export const PriceConfigs : {[key: string]: PriceConfig} = {
    "goerli": GOERLI,
    "polygon": POLYGON,
    "mumbai": MUMBAI,
};

export function gasTokenPricePerGwei(
    chain: Chain,
    token: string,
    decimals: number,
    price: PriceConfig
) : string {
    if (isNativeCoin(token, chain) || isWrappedCoin(token, chain)) {
        return "1000000000"; // 1Gwei = 10^9 wei
    }
    if (isStableCoin(token, chain)) {
        const oneEth = BigNumber(10).pow(decimals).times(price.nativeCurrencyInUsd)
        const oneGwei = EthBigNumber.from(oneEth.div(1000000000).toString(10));
        return oneGwei.toString();
    }
    throw new Error("Not supported gas token");
};

function getGasPrice(price: PriceInfo) {
    let gasPrice = EthBigNumber.from(
        price.lastBaseFeePerGas
    ).add(price.maxPriorityFeePerGas);
    gasPrice = gasPrice.gt(price.maxFeePerGas)
        ? EthBigNumber.from(price.maxFeePerGas)
        : gasPrice;
    return gasPrice.gt(price.defaultGasPrice)
        ? gasPrice
        : price.defaultGasPrice;
}

export function calcGas(
    chain: Chain,
    gasToken: {
        address: string,
        decimals: number,
    },
    amount: EthBigNumber,
    priceInfo: PriceInfo,
  ) : EthBigNumber {
    const gasPrice = getGasPrice(priceInfo);
    if (isNativeCoin(gasToken.address, chain) || isWrappedCoin(gasToken.address, chain)) {
        return amount.mul(gasPrice);
    } else if (isStableCoin(gasToken.address, chain)) {
        // calculate usd value of tokens
        const normalizedUsd = new BigNumber(10).pow(
            gasToken.decimals
        ).times(priceInfo.nativeCurrencyInUsd);
        const nativeCoinBase = EthBigNumber.from(
            10
        ).pow(chain.nativeCurrency.decimals);
        return toEthBigNumber(normalizedUsd).mul(
            amount).mul(gasPrice).div(nativeCoinBase);
    }
    throw new Error("Unsupported gas token");
  }