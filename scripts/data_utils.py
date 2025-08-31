from datetime import datetime



def format_time_unique(expiration_dates):
    today = datetime.today().date()
    labels = []

    for expiry_str in expiration_dates:
        expiry_date = datetime.strptime(expiry_str, "%Y-%m-%d").date()
        days = (expiry_date - today).days

        if days < 30:
            label = f"{days} days"
        else:
            months = days // 30
            if months < 12:
                label = f"{months} months"
            else:
                years = months // 12
                label = f"{years} years"

        labels.append(label)

    return labels
