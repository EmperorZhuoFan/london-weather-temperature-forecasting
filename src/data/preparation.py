import pandas as pd 

def validate_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Generate a report of missing values and their missing percentages."""

    missing_values = df.isnull().sum()
    missing_values = missing_values[missing_values > 0]

    missing_values_percentage = (
        missing_values.div(len(df)).mul(100).round(2)
    )

    missing_report = pd.DataFrame({
        "Columns": missing_values.index, 
        "Missing": missing_values.values, 
        "Missing %": missing_values_percentage.values
    })

    missing_report = missing_report.sort_values(
        by="Missing", ascending=False
        ).reset_index(drop=True)

    missing_report["Missing %"] = missing_report["Missing %"].astype(str) + "%"        

    return missing_report


def validate_duplicates(df: pd.DataFrame) -> int:
    """Count duplicates rows in the dataframe."""

    count_duplicates  =int(df.duplicated().sum())

    return count_duplicates

def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    missings = df.isnull().sum()
    missings = missings[missings > 0]
    missing_percentage = missings.div(len(df)).mul(100)

    # Classify columns using the 5% rule
    drop_cols = [col for col, percentage in missing_percentage.items() if percentage < 5]
    impute_cols = [col for col, percentage in missing_percentage.items() if percentage >= 5]

    # A. Drop rows with missing values in columns below 5%
    if drop_cols:
        df = df.dropna(subset=drop_cols)

    # B. Impute columns with 5% or more missing values
    numeric_cols = df[impute_cols].select_dtypes(include="number").columns
    categorical_cols = df[impute_cols].select_dtypes(include=["object", "category"]).columns

    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].median())

    for col in categorical_cols:
        mode = df[col].mode()
        if not mode.empty:
            df[col] = df[col].fillna(mode[0])

    return df