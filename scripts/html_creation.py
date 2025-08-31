import sys
from datetime import datetime
from generate_surface import generate_iv_surface

Tickers = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'NVDA', 'META', 'NFLX', 'AMZN']  

def main():
    for ticker in Tickers:
        try:
            generate_iv_surface(ticker)
        except Exception as e:
            print(f"Error processing {ticker}: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()