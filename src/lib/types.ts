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
    history: PriceCandle[]; 
    trades: Trade[]; 
}

export interface StrategyDecision {
    amountUsd: number;
}

export interface Strategy {
    id: string;
    label: string;
    decide(context: StrategyContext): StrategyDecision | null;
}

export interface PortfolioPoint {
    date: string;           
    btcAccumulated: number;
    investedUsd: number;   
    portfolioValueUsd: number; 

}