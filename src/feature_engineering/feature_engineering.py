
import numpy as np
import pandas as pd


def extract_date_features(df: pd.DataFrame) -> pd.DataFrame:
    """Convert dates and extract cyclical seasonal features."""

    df = df.copy()

    df["date"] = pd.to_datetime(
        df["date"],
        format="%Y%m%d",
        errors="raise"
    )

    month = df["date"].dt.month

    df["month_sin"] = np.sin(2 * np.pi * month / 12)
    df["month_cos"] = np.cos(2 * np.pi * month / 12)

    return df


def create_lag_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create lag features from previous mean temperature observations."""

    df = df.copy()

    for lag in [1, 7, 30]:
        df[f"mean_temp_lag_{lag}"] = df["mean_temp"].shift(lag)

    return df


def create_rolling_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create rolling averages using only previous temperature observations."""

    df = df.copy()

    previous_temps = df["mean_temp"].shift(1)

    for window in [7, 30]:
        df[f"rolling_mean_{window}"] = (
            previous_temps.rolling(window=window, min_periods=window).mean()
        )

    return df


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Sort observations and apply date, lag, and rolling feature engineering."""

    df = df.copy()

    df = extract_date_features(df)

    df = df.sort_values("date").reset_index(drop=True)

    df = create_lag_features(df)
    df = create_rolling_features(df)

    return df
