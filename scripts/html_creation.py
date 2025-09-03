import sys
from datetime import datetime
from generate_surface import generate_iv_surface

import os
import json

Tickers = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'NVDA', 'META', 'NFLX', 'AMZN']  

def main():
    for ticker in Tickers:
        try:
            generate_iv_surface(ticker)
        except Exception as e:
            print(f"Error processing {ticker}: {e}", file=sys.stderr)

def create_manifest():
    data_dir = "docs/data"
    manifest = {}

    for ticker in os.listdir(data_dir):
        ticker_path = os.path.join(data_dir, ticker)
        if os.path.isdir(ticker_path):
            files = sorted(os.listdir(ticker_path))
            manifest[ticker] = files
    with open(os.path.join(data_dir, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)


if __name__ == "__main__":
    main()
    create_manifest()