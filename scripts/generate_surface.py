import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
from scipy.interpolate import griddata, NearestNDInterpolator

from black_scholes import implied_volatility

import plotly.graph_objects as go
import os



def safe_implied_vol(row, S, T, r, option_type='call'):
    mid_price = (row['bid'] + row['ask']) / 2
    if pd.isna(mid_price) or mid_price <= 0:
        return np.nan
    intrinsic = max(S - row['strike'], 0)

    if option_type == 'put':
        intrinsic = max(row['strike'] - S, 0)
    if mid_price < intrinsic or T <= 0:
        return np.nan  # Price below intrinsic value, invalid IV
    if option_type == 'put':
        return implied_volatility(mid_price, S, row['strike'], T, r, 'put')
    else:
        return implied_volatility(mid_price, S, row['strike'], T, r, 'call')

        return np.nan


def estimate_iv_surface(stock, expiration_dates, r, strike_percent_range):
    S = stock.history(period='1d')['Close'].iloc[-1]
    all_iv_data = []

    for expiry in expiration_dates:
        

            
            days_to_exp = (datetime.strptime(expiry, "%Y-%m-%d") - datetime.today()).days
            T = days_to_exp / 365.0

            if days_to_exp <= 25:
                continue  # Skip very short expirations

            opt_chain = stock.option_chain(expiry)
            calls = opt_chain.calls.copy()
            puts = opt_chain.puts.copy()

            # Basic filters
            calls = calls[(calls['bid'] > 0.5) & (calls['ask'] > 0.5) & (calls['strike'] > 0)]
            puts = puts[(puts['bid'] > 0.5) & (puts['ask'] > 0.5) & (puts['strike'] > 0)]

            # Filter by percentage of strike range
            min_strike = calls['strike'].min()
            max_strike = calls['strike'].max()
            strike_range = max_strike - min_strike
            pct_min, pct_max = strike_percent_range
            lower = min_strike + (pct_min / 100) * strike_range
            upper = min_strike + (pct_max / 100) * strike_range
            calls = calls[(calls['strike'] >= lower) & (calls['strike'] <= upper)]

            # Calculate implied volatility
            calls['implied_vol'] = calls.apply(lambda row: safe_implied_vol(row, S, T, r), axis=1)
            puts['implied_vol'] = puts.apply(lambda row: safe_implied_vol(row, S, T, r, 'put'), axis=1)

            # Combine and filter IV data
            calls = calls[['strike', 'implied_vol']].dropna()
            puts = puts[['strike', 'implied_vol']].dropna()

            calls['expiration'] = expiry
            puts['expiration'] = expiry
            all_iv_data.append(calls)
 


    

    combined_df = pd.concat(all_iv_data)
    combined_df['time_to_expiry'] = combined_df['expiration'].apply(
        lambda d: (datetime.strptime(d, "%Y-%m-%d") - datetime.today()).days
    )
    combined_df = combined_df[combined_df['implied_vol'] <= 1.0]  # Remove junk data

    strikes = combined_df['strike'].values
    times = combined_df['time_to_expiry'].values
    ivs = combined_df['implied_vol'].values

    # Mesh for interpolation
    strike_grid = np.linspace(strikes.min(), strikes.max(), 30)
    time_grid = np.linspace(times.min(), times.max(), 30)
    strike_mesh, time_mesh = np.meshgrid(strike_grid, time_grid)

    # Interpolate IV values
    iv_grid = griddata(
        points=(strikes, times),
        values=ivs,
        xi=(strike_mesh, time_mesh),
        method='linear'
    )

    # Fill missing values using nearest neighbors
    nearest_interp = NearestNDInterpolator(list(zip(strikes, times)), ivs)
    mask_nan = np.isnan(iv_grid)
    iv_grid[mask_nan] = nearest_interp(strike_mesh[mask_nan], time_mesh[mask_nan])

    # Plot
    fig = go.Figure(data=[go.Surface(z=iv_grid, x=strike_grid, y=time_grid, colorscale='Viridis')])
    fig.update_layout(
        title=f"Implied Volatility Surface for {stock}",
        scene=dict(
            xaxis_title='Strike Price',
            yaxis_title='Days to Expiration',
            zaxis_title='Implied Volatility',
            yaxis_autorange='reversed'
        ),
        height=700
    )

    output_path = f"data/{stock.ticker}/{datetime.today().date()}_surface.html"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    fig.write_html(output_path, include_plotlyjs='cdn')
    
    return fig

def generate_iv_surface(ticker: str, r=0.01, strike_range=(20, 80)):
    stock = yf.Ticker(ticker)
    expiration_dates = stock.options
    if not expiration_dates:
         print("No options data available.")
    else:
        return estimate_iv_surface(stock, expiration_dates, r, strike_range)
