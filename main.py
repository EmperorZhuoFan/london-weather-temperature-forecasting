from pathlib import Path
import pandas as pd

from src.data.loading import load_data, save_processed_data
from src.data.preparation import (
    handle_missing_values,
    validate_duplicates,
    validate_missing_values,
)
from src.feature_engineering.feature_engineering import build_features
from src.models.supervised import run_supervised_learning
from src.evaluation.supervised_eval import run_evaluation_supervised

file_path = r"F:\CS-Year3-First Semester\Machine Learning\London Weather ML Project\data\raw\london_weather.csv"
procesed_data_path = r"F:\CS-Year3-First Semester\Machine Learning\London Weather ML Project\data\processed\processed_london_weather"

def main() -> None:
    df = load_data(file_path)

    print("Missing values:")
    missing_report = validate_missing_values(df)
    print(missing_report)
    print(f"Duplicate rows: {validate_duplicates(df)}")

    df = handle_missing_values(df)
    df = build_features(df)
    df = handle_missing_values(df)

    save_processed_data(df, procesed_data_path)

    tuned_models, search_results, cv_results, x_test, y_test = (
        run_supervised_learning(df)
    )
    print(f"Tuned models: \n{tuned_models}")
    print(f"Cross-Validation reults: \n{cv_results}")

    evaluation_results = run_evaluation_supervised(tuned_models,
                                                   x_test, y_test)
    print(f"Evaluation regression models:\n{evaluation_results}")

    print("=" * 70)

    for model_name, search in search_results.items():
        print(f"{model_name}: {search.best_params_}")

    path = Path("./data/ml_models_report/evaluation_results.csv")
    evaluation_results.to_csv(path, index=False)


if __name__ == "__main__":
    main()