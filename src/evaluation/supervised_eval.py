import pandas as pd

from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline


def evaluate_regression_models(
        model_name: str,
        model: Pipeline,
        x_test: pd.DataFrame,
        y_test: pd.Series
    ) -> dict:
    """Evaluate regression models using test-performance metrices."""

    predictions = model.predict(x_test)

    evaluation_dict = {
        "Model": model_name,
        "MAE": mean_absolute_error(y_test, predictions), 
        "MSE": mean_squared_error(y_test, predictions),
        "RMSE": ((mean_squared_error(y_test, predictions)) ** 0.5),
        "R2": r2_score(y_test, predictions)
    }

    return evaluation_dict

def evaluate_supervised_models(
        models: dict[str, Pipeline],
        x_test: pd.DataFrame,
        y_test: pd.Series
) -> pd.DataFrame:
    """Evaluate all models using test-set performance metrics."""

    evaluation_results = []

    for model_name, model in models.items():
        model_evaluation = evaluate_regression_models(
            model_name, model, x_test, y_test
        )

        evaluation_results.append(model_evaluation)
    evaluation_results = pd.DataFrame(evaluation_results)

    return evaluation_results


def run_evaluation_supervised(
        models: dict[str, Pipeline],
        x_test: pd.DataFrame,
        y_test: pd.Series
) -> pd.DataFrame:
    """Run the complete evaluation workflow for supervised and unsupervised learning."""

    if not models:
        raise ValueError("No supervised models were provided.")

    if len(x_test) != len(y_test):
        raise ValueError("x_test and y_test must contain the same number of rows.")

    evaluation_results = evaluate_supervised_models(models, x_test,
                                                    y_test)
    return evaluation_results