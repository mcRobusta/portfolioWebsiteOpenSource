from flask import Flask, request, jsonify
import yfinance
from flask_cors import CORS

def getStockDataFromYahoo(requestedData):
    stockData = yfinance.download( # Downloads a Pandas DataFrame of the stocks listed in "ticker", which is nice but not JS friendly.
        requestedData["ticker"], 
        start=requestedData["startDate"], 
        end=requestedData["endDate"])
    tickers = requestedData["ticker"].split(" ") # The data is passed in as space-separated tickers, so we need to put this into a list for Python to iterate through.
    formattedStockData = [stockData['Close'][ticker].tolist() for ticker in tickers] # Puts the data into a Python list, which JS can play with a little nicer.
    return formattedStockData

app = Flask(__name__)
CORS(app, origins='*') # IMPORTANT! Only allows functions ending with the domain vercel.app to send data to the browser.

@app.route('/')
def home():
    return "Well, you made it this far."

@app.route("/getStockData", methods=["POST"])
def getStockData():
    requested_data = request.json
    result = getStockDataFromYahoo(requested_data)
    response = jsonify(result)
    return response