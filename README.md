# Daily Life Carbon Footprint Visualizer

A full-stack web app for estimating daily carbon emissions from transportation, energy, diet, waste, and flights. The app includes a React-based UI and an Express backend API.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   npm install --prefix client
   ```
2. Start the development environment:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Build for production

```bash
npm run build
```

Then run the server:

```bash
npm start
```

## Features

- Activity form to capture daily habits
- Live carbon footprint estimation
- Category breakdown and visual chart
- Submission history stored on the backend

## Deploying to GitHub and Render

1. Initialize git and commit the project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Daily Life Carbon Footprint Visualizer"
   ```
2. Create a GitHub repository named `daily-life-carbon-footprint-visualizer` under your account `Tanmay-1007`.
3. Add the remote and push:
   ```bash
   git remote add origin https://github.com/Tanmay-1007/daily-life-carbon-footprint-visualizer.git
   git branch -M main
   git push -u origin main
   ```
4. Deploy on Render.com:
   - Create a new Web Service and connect the repository.
   - Set the build command to:
     ```bash
     npm install && npm install --prefix client && npm run build --prefix client
     ```
   - Set the start command to:
     ```bash
     npm start
     ```
   - Render will use the `PORT` environment variable automatically.
