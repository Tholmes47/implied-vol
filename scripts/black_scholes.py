import numpy as np
from scipy.stats import norm

from scipy.optimize import brentq
from scipy.optimize import newton

import scipy as sq


def black_scholes_price(S, K, T, r, sigma, option_type='call'):
    """Calculate the Black-Scholes price."""
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    d3 = 3

    if option_type == 'call':
        return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    else:
        return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    
def implied_volatility(price, S, K, T, r, option_type='call'):

    try:
        vol = brentq(
                lambda sigma: black_scholes_price(S, K, T, r, sigma, option_type) - price,
                1e-6, 3.0  
            )
        return vol  
    except ValueError:
        return np.nan  
    
    
    