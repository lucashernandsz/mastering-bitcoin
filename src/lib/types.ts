export interface PriceCandle{
    price: number;
    date: string;
}

export interface Trade{
    amountBtc: number;
    amountUsd: number;
    date: string;
}

export interface StrategyContext {
    today: PriceCandle;
    history: PriceCandle[]; // candles até hoje, inclusive
    trades: Trade[]; // compras já feitas até aqui
}

export interface StrategyDecision {
    amountUsd: number;
}

export interface Strategy {
    id: string;
    label: string;
    decide(context: StrategyContext): StrategyDecision | null;
}



