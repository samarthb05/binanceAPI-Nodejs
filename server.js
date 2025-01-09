const Binance = require("node-binance-api");
const axios = require("axios");
const { RSI } = require("technicalindicators");
require("dotenv").config();

const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
});

//TO GET MARKET CANDLE DATA
const getMarketData = async (symbol, interval) => {
  try {
    const candles = await binance.candlesticks(symbol, interval);
    return candles.map((candles) => ({
      openTime: candles[0],
      open: parseFloat(candles[1]),
      high: parseFloat(candles[2]),
      low: parseFloat(candles[3]),
      close: parseFloat(candles[4]),
      volume: parseFloat(candles[5]),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

(async () => {
  const marketData = await getMarketData("BTCUSDT", "1m");
  console.log(marketData);
})();

const calculateRSI = (prices, period = 14) => {
  return RSI.calculate({ values: prices, period });
};

const executateTrade = async (Symbol, side, quantity) => {
  try {
    const order = await binance.marketOrder(Symbol, side, quantity);
    console.log("Order Executed!", order);
  } catch (error) {
    console.error(error);
  }
};

const scalpingStrategy = async (Symbol) => {
  const marketData = await getMarketData(Symbol, "1m");
  if (!Array.isArray(marketData) || marketData.length === 0) {
    console.error("No data available!");
    return;
  }
  const closingPrices = marketData.map((data) => data.close);
  const rsiValues = calculateRSI(closingPrices);
  const lastRSI = rsiValues[rsiValues.length - 1];
  console.log(lastRSI);

  const quantity = 0.001;
  if (lastRSI < 30) {
    //buy instruction
    await executateTrade(Symbol, "BUY", quantity);
  } else if (lastRSI > 70) {
    //sell instruction
    await executateTrade(Symbol, "SELL", quantity);
  }
};

setInterval(() => {
  scalpingStrategy("BTCUSDT");
}, 60000);
