import pandas as pd
import time 

from sklearn.model_selection import (train_test_split, GridSearchCV,
                                     cross_val_score, TimeSeriesSplit)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.svm import SVR


def prepare_model_data(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Prepare the engineered data for the supervised learning by separating features from the target."""

    df = df.copy()

    features = ["month_sin", "month_cos", "cloud_cover","sunshine",
                "global_radiation", "precipitation", "pressure",
                "snow_depth", "mean_temp_lag_1","mean_temp_lag_7",
                "mean_temp_lag_30", "rolling_mean_7", "rolling_mean_30"]

    target = "mean_temp"

    x = df[features]
    y = df[target]

    return x, y


def create_preprocessor() -> ColumnTransformer:
    """Create the preprocessing pipeline for the numerical features."""


    features = ["month_sin", "month_cos", "cloud_cover","sunshine",
                    "global_radiation", "precipitation", "pressure",
                    "snow_depth", "mean_temp_lag_1","mean_temp_lag_7",
                    "mean_temp_lag_30", "rolling_mean_7", "rolling_mean_30"]

    numerical_transformers = Pipeline([("scaler", StandardScaler())])
    preprocessor = ColumnTransformer([("num", numerical_transformers, features)])

    return preprocessor


def split_data(x: pd.DataFrame, y: pd.Series) \
 -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Split features and target into training and testing datasets."""

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, shuffle=False
    )

    return x_train, x_test, y_train, y_test


def train_baseline(
        x_train: pd.DataFrame, 
        y_train: pd.Series) -> Pipeline:
    """Train a baseline model to establish a reference performance."""

    baseline = Pipeline([
        ("preprocessor", create_preprocessor()), 
        ("model", DummyRegressor(strategy="median"))
    ])

    baseline.fit(x_train, y_train)

    return baseline


def train_LinearRegression(
        x_train: pd.DataFrame, 
        y_train: pd.Series
) -> Pipeline:
    """Train a Lienar Regressor using prepared tainging package."""

    linear_regression = Pipeline([
        ("preprocessor", create_preprocessor()), 
        ("model", LinearRegression())
    ])

    linear_regression.fit(x_train, y_train)

    return linear_regression


def train_DecisionTreeRegressor(
        x_train: pd.DataFrame, 
        y_train: pd.Series
) -> Pipeline:
    """Train a decision tree regressor using the prepared package."""

    decision_tree_reg = Pipeline([
        ("preprocessor", create_preprocessor()), 
        ("model", DecisionTreeRegressor())
    ])

    decision_tree_reg.fit(x_train, y_train)

    return decision_tree_reg


def train_KNeighborsRegressor(
        x_train: pd.DataFrame, 
        y_train: pd.Series
) -> Pipeline: 
    """Train a k-neighbors regressor using the prepared data."""

    knn = Pipeline([
        ("preprocessor", create_preprocessor()),
        ("model", KNeighborsRegressor(n_neighbors=5))
    ])

    knn.fit(x_train, y_train)

    return knn

def train_svm(
        x_train: pd.DataFrame,
        y_train: pd.Series
) -> Pipeline:
    """Train Support-Vector Regression model."""

    svm = Pipeline([
        ("preprocessor", create_preprocessor()),
        ("model", SVR())
    ])

    svm.fit(x_train, y_train)

    return svm

def build_models_registry(
        baseline: Pipeline, 
        linear_regression: Pipeline, 
        decision_tree_reg: Pipeline, 
        knn: Pipeline,
        svm: Pipeline
) -> dict[str, Pipeline]:
    """Build a registry containging all the trained models."""

    models = {
        "Baseline model": baseline, 
        "LinearRegression model": linear_regression, 
        "DecisionTreeRegressor model": decision_tree_reg, 
        "KNeighborsRegressor model": knn,
        "SVR model": svm
    }

    return models


def cross_validation_model(
        models: dict[str, Pipeline], 
        x_train: pd.DataFrame, 
        y_train: pd.Series
) -> pd.DataFrame:
    """Evaluate all models using croos-validation."""

    cv_results = []
    tscv = TimeSeriesSplit(n_splits=5)

    for name, model in models.items():
        score = cross_val_score(model, x_train, y_train,
                                cv=tscv, scoring="r2", n_jobs=-1)

        cv_results.append({"Model": name, "Mean R2": score.mean()})

    cv_results = pd.DataFrame(cv_results).sort_values("Mean R2", ascending=False)

    return cv_results


def hyperparameter_tuning(
        models: dict[str, Pipeline],
        x_train: pd.DataFrame, 
        y_train: pd.Series
) -> tuple[dict[str, Pipeline], dict[str, GridSearchCV]]:
    """Tune supervised models using cross-validation grid search."""

    tuned_models = {}
    search_results = {}
    tscv = TimeSeriesSplit(n_splits=5)

    parameter_grids = {
        "LinearRegression model": {
            "model__fit_intercept": [True, False]
        },

        "DecisionTreeRegressor model": {
            "model__max_depth": [5, 10, 20, None],
            "model__min_samples_split": [2, 5, 10],
            "model__min_samples_leaf": [1, 2, 5],
            "model__criterion": ["squared_error", "absolute_error"]
        },

        "KNeighborsRegressor model": {
            "model__n_neighbors": [3, 5, 7, 9, 11],
            "model__weights": ["uniform", "distance"],
            "model__p": [1, 2]
        },

        "SVR model": {
            "model__kernel": ["linear", "rbf"],
            "model__C": [1, 10],
            "model__epsilon": [0.1, 0.5]
        }
    }

    for model_name, model in models.items():
        if model_name == "Baseline model":
            continue

        param_grid = parameter_grids[model_name]
        grid_search = GridSearchCV(estimator=model, param_grid=param_grid,
                                   cv=tscv, scoring="r2", n_jobs=-1)
        
        grid_search.fit(x_train, y_train)

        best_model = grid_search.best_estimator_

        tuned_models[model_name] = best_model
        search_results[model_name] = grid_search

    return tuned_models, search_results


def run_supervised_learning(df: pd.DataFrame) \
    -> tuple[dict[str, Pipeline], dict, pd.DataFrame,
             pd.DataFrame, pd.Series]:
    """Run the complete supervised learning workflowed functions."""

    start_time = time.time()

    print("=" * 70)
    print("SUPERVISED LEARNING")
    print("=" * 70)

    print("preparing model data....")
    x, y = prepare_model_data(df)
    print(f"Copleted in {time.time() - start_time:.2f}s")
    print("-" * 15 + " " + "-" * 15)

    print("Splitting data...")
    x_train, x_test, y_train, y_test = split_data(x, y)
    print(f"Copleted in {time.time() - start_time}s")
    print("-" * 15 + " " + "-" * 15)

    print("Training baseline...")
    baseline_model = train_baseline(x_train, y_train)
    print(f"Baseline completed in {time.time() - start_time:.2f}s")
    print("-" * 15 + " " + "-" * 15)

    print("Training linear regression...")
    linear_regression = train_LinearRegression(x_train, y_train)
    print(f"Linear regression completed in {time.time() - start_time:.2f} seconds")
    print("-" * 15 + " " + "-" * 15)

    print("Training decision tree...")
    decision_tree_reg = train_DecisionTreeRegressor(x_train, y_train)
    print(f"Decision tree completed in {time.time() - start_time:.2f} seconds")
    print("-" * 15 + " " + "-" * 15)

    print("Training KNN...")
    knn = train_KNeighborsRegressor(x_train, y_train)
    print(f"KNN completed in {time.time() - start_time:.2f} seconds")
    print("-" * 15 + " " + "-" * 15)

    print("Training SVM...")
    svm = train_svm(x_train, y_train)
    print(f"SVM completed in {time.time() - start_time:.2f} seconds")
    print("-" * 15 + " " + "-" * 15)

    models = build_models_registry(
        baseline_model,
        linear_regression,
        decision_tree_reg,
        knn,
        svm)

    print("Cross-validating models...")
    cv_results = cross_validation_model(models, x_train, y_train)
    print(f"Cross-validation completed in {time.time() - start_time:.2f} seconds")
    print("-" * 15 + " " + "-" * 15)
    print("Tuning models...")
    tuned_models, search_results = hyperparameter_tuning(
        models,
        x_train,
        y_train
    )
    print(f"Model tuning completed in {time.time() - start_time:.2f} seconds")
    print("-" * 15 + " " + "-" * 15)

    return tuned_models, search_results, cv_results, x_test, y_test