import yfinance

def getStockDataFromYahoo(requestedData):
    stockData = yfinance.download(
        requestedData["ticker"], 
        start=requestedData["startDate"], 
        end=requestedData["endDate"])
    return stockData['Close'].tolist()