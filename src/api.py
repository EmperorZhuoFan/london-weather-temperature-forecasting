from contextlib import asynccontextmanager
from datetime import date
from pathlib import Path
from typing import Literal

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.data.loading import load_data
from src.data.preparation import handle_missing_values
from src.feature_engineering.feature_engineering import build_features
from src.models.supervised import (
    prepare_model_data,
    split_data,
    train_LinearRegression,
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "raw" / "london_weather.csv"


class WeatherInputs(BaseModel):
    cloud: float = Field(ge=0, le=8)
    sunshine: float = Field(ge=0, le=16)
    radiation: float = Field(ge=0, le=350)
    precip: float = Field(ge=0, le=30)
    pressure: float = Field(ge=970, le=1050)
    snow: float = Field(ge=0, le=20)


class PredictionRequest(BaseModel):
    date: date
    inputs: WeatherInputs


class PredictionResponse(PredictionRequest):
    temp: float
    low: float
    high: float
    category: Literal["cold", "hot", "rainy", "cloudy", "mild"]
    rule: str


class WeatherPredictor:
    def __init__(self, dataset_path: Path):
        data = handle_missing_values(load_data(dataset_path))
        self.history = data.copy()
        self.history["date"] = pd.to_datetime(
            self.history["date"], format="%Y%m%d", errors="raise"
        )
        self.history = self.history.sort_values("date").reset_index(drop=True)

        model_data = handle_missing_values(build_features(data))
        x, y = prepare_model_data(model_data)
        x_train, x_test, y_train, y_test = split_data(x, y)

        validation_model = train_LinearRegression(x_train, y_train)
        errors = np.abs(y_test - validation_model.predict(x_test))
        self.interval = float(np.quantile(errors, 0.9))
        self.model = train_LinearRegression(x, y)

    def predict(self, prediction_date: date, inputs: WeatherInputs) -> dict:
        history = self.history.loc[
            self.history["date"] < pd.Timestamp(prediction_date), "mean_temp"
        ]
        if len(history) < 30:
            raise ValueError("At least 30 earlier temperature observations are required.")

        recent = history.tail(30)
        month = prediction_date.month
        features = pd.DataFrame(
            [
                {
                    "month_sin": np.sin(2 * np.pi * month / 12),
                    "month_cos": np.cos(2 * np.pi * month / 12),
                    "cloud_cover": inputs.cloud,
                    "sunshine": inputs.sunshine,
                    "global_radiation": inputs.radiation,
                    "precipitation": inputs.precip,
                    "pressure": inputs.pressure,
                    "snow_depth": inputs.snow,
                    "mean_temp_lag_1": recent.iloc[-1],
                    "mean_temp_lag_7": recent.iloc[-7],
                    "mean_temp_lag_30": recent.iloc[0],
                    "rolling_mean_7": recent.tail(7).mean(),
                    "rolling_mean_30": recent.mean(),
                }
            ]
        )
        temperature = float(self.model.predict(features)[0])
        category, rule = classify_weather(temperature, inputs)

        return {
            "date": prediction_date,
            "inputs": inputs,
            "temp": temperature,
            "low": temperature - self.interval,
            "high": temperature + self.interval,
            "category": category,
            "rule": rule,
        }


def classify_weather(temperature: float, inputs: WeatherInputs) -> tuple[str, str]:
    if inputs.snow > 0:
        return "cold", "Snow depth above 0 cm"
    if inputs.precip >= 1.5 and temperature > 2:
        return "rainy", "Precipitation of 1.5 mm or more"
    if temperature >= 23:
        return "hot", "Predicted temperature of 23°C or more"
    if temperature <= 6:
        return "cold", "Predicted temperature of 6°C or less"
    if inputs.cloud >= 6:
        return "cloudy", "Cloud cover of 6 oktas or more"
    return "mild", "Moderate temperature, light cloud and little rain"


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.predictor = WeatherPredictor(DATA_PATH)
    yield


app = FastAPI(title="London Weather Forecast API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health(request: Request) -> dict[str, str]:
    return {"status": "ok" if hasattr(request.app.state, "predictor") else "starting"}


@app.post("/api/predict", response_model=PredictionResponse)
def predict_weather(
    prediction: PredictionRequest, request: Request
) -> PredictionResponse:
    try:
        result = request.app.state.predictor.predict(
            prediction.date, prediction.inputs
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return PredictionResponse(**result)