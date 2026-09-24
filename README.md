# FoodWise — AI-Based Food Waste Prediction

FoodWise turns college canteen service logs into clear next-day preparation recommendations. This monorepo contains a React/Tailwind operations dashboard, Express/MongoDB REST API, and FastAPI/scikit-learn prediction service.

## Local setup

1. Install Node 20+, Python 3.10+, and MongoDB (or use MongoDB Atlas).
2. Run `npm install` at the repository root. Copy `server/.env.example` to `server/.env`, then supply a real `JWT_SECRET` and Mongo connection string.
3. In `ml-service`, create a virtual environment and run `pip install -r requirements.txt`; start it with `uvicorn main:app --reload --port 8000`.
4. Run `npm run dev` at the root. The dashboard opens at `http://localhost:5173` and the API runs on port 5000.

The development login is `admin@foodwise.in` / `foodwise123`.

## Dataset and model

Service logs store date, meal, dish, quantity prepared, consumed, wasted, student count, weather, and campus event. The ML service demonstrates Random Forest regression with weekday, attendance, event, holiday, and trend-style features. It returns holdout MAE and RMSE with every forecast. For production, replace the deterministic generated sample in `ml-service/main.py` with exported MongoDB history, then persist a trained model using joblib.

Random Forest was chosen over a simple linear model because it captures non-linear demand shifts from events and changing footfall without demanding a huge dataset. The model output remains interpretable because the API returns the relevant forecast features and a confidence score.

## Measuring the 20% reduction goal

For each historical day, calculate baseline waste as `(prepared - consumed) / prepared`. Then simulate the model-guided plan with `max(predicted - consumed, 0) / predicted`. The target is achieved when `(baselineWasteKg - modelWasteKg) / baselineWasteKg >= 0.20` across a holdout period. The dashboard sample visualizes the before/after direction; an actual ≥20% claim should be reported only after importing genuine service logs and running this evaluation.

## Deploy

Deploy `client` to Vercel, and `server` plus `ml-service` as separate Render or Railway services.

1. Create an Atlas database user and add the hosting provider's outbound IP range to Atlas Network Access. Put its connection string in `MONGODB_URI` on the backend service.
2. On the backend, configure `JWT_SECRET`, `ML_SERVICE_URL` (the deployed ML service URL), and `CORS_ORIGIN` (the Vercel frontend URL). Never commit these values.
3. On Vercel, set `VITE_API_URL` to `https://your-backend-domain/api`, then redeploy. Locally, leave it unset so Vite proxies `/api` to port 5000.
4. Check `https://your-backend-domain/api/health`. A response with `database: "connected"` confirms the API can reach Atlas; `degraded` means it will retry automatically while Atlas is unavailable.
