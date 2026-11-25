
import math
from pathlib import Path

import mlflow
import mlflow.sklearn
from mlflow.models import infer_signature
from sklearn.pipeline import Pipeline


def create_experiment(experiment_name: str = "London Weather Temperature Forecasting") -> str:
    """
    Create or select the MLflow experiment.

    Returns:
        The experiment ID.
    """
    experiment = mlflow.set_experiment(experiment_name)
    return experiment.experiment_id


def _format_params(params: dict) -> dict:
    """Convert parameter values into MLflow-compatible strings."""
    return {
        key: str(value)
        for key, value in params.items()
    }


def _format_metrics(metrics: dict) -> dict:
    """Keep only valid finite numerical metrics."""
    formatted_metrics = {}

    for key, value in metrics.items():
        try:
            numeric_value = float(value)

            if math.isfinite(numeric_value):
                formatted_metrics[key] = numeric_value

        except (TypeError, ValueError):
            continue

    return formatted_metrics


def track_hyperparameter_runs(search_result, model_name: str = "Linear Regression",
                              experiment_name: str = "London Weather Temperature Forecasting") -> list[str]:
    """
    Track every hyperparameter candidate evaluated by GridSearchCV.

    Each candidate receives a separate MLflow run containing
    its parameters and cross-validation R2 scores.

    Args:
        search_result: Fitted GridSearchCV object.
        model_name: Name of the model being tuned.
        experiment_name: MLflow experiment name.

    Returns:
        List of MLflow run IDs.
    """
    if not hasattr(search_result, "cv_results_"):
        raise ValueError("GridSearchCV must be fitted before tracking its results.")

    create_experiment(experiment_name)

    cv_results = search_result.cv_results_
    run_ids = []

    for index, params in enumerate(cv_results["params"]):
        metrics = {
            "cv_r2_mean": cv_results["mean_test_score"][index],
            "cv_r2_std": cv_results["std_test_score"][index],
            "cv_rank": cv_results["rank_test_score"][index]
        }

        fold = 0

        while f"split{fold}_test_score" in cv_results:
            metrics[f"cv_r2_fold_{fold + 1}"] = (cv_results[f"split{fold}_test_score"][index])
            fold += 1

        with mlflow.start_run(run_name=f"{model_name}_candidate_{index + 1}") as run:

            mlflow.set_tags({
                "model_name": model_name,
                "run_type": "hyperparameter_tuning",
                "candidate": str(index + 1)
            })

            mlflow.log_params(_format_params(params))
            mlflow.log_metrics(_format_metrics(metrics))

            run_ids.append(run.info.run_id)

    return run_ids


def track_final_model(model: Pipeline, params: dict, metrics: dict, artifact_paths: list[str | Path] | None = None,
    input_example=None, experiment_name: str = "London Weather Temperature Forecasting") -> str:
    """
    Track the final selected model, its test metrics,
    model artifact, and supporting artifacts.

    Args:
        model: Fitted sklearn Pipeline.
        params: Selected model hyperparameters.
        metrics: Final test-set evaluation metrics.
        artifact_paths: Supporting files to log as artifacts.
        input_example: Optional DataFrame showing model input format.
        experiment_name: MLflow experiment name.

    Returns:
        The final MLflow run ID.
    """
    create_experiment(experiment_name)

    with mlflow.start_run(run_name="LinearRegression_Final") as run:

        mlflow.set_tags({
            "model_name": "Linear Regression",
            "run_type": "final_model",
            "selected_model": "true"
        })

        mlflow.log_params(_format_params(params))
        mlflow.log_metrics(_format_metrics(metrics))

        # Generate the model signature when an input example is provided.
        signature = None

        if input_example is not None:
            predictions = model.predict(input_example)
            signature = infer_signature(
                input_example,
                predictions
            )

        # Log the complete preprocessing + regression pipeline.
        mlflow.sklearn.log_model(
            sk_model=model,
            artifact_path="model",
            signature=signature,
            input_example=input_example
        )

        # Log supporting files.
        if artifact_paths:
            for artifact_path in artifact_paths:
                artifact_path = Path(artifact_path)

                if not artifact_path.is_file():
                    raise FileNotFoundError(f"Artifact file not found: {artifact_path}")

                mlflow.log_artifact(str(artifact_path))

        run_id = run.info.run_id

    return run_id




print(track_final_model.__doc__)