# WeatherGPT - Precision AgriTech Weather & Agronomy Platform 🌾🚜

[![Live Demo](https://img.shields.io/badge/Live%20Prototype-Open%20WeatherGPT-2ea44f?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ais-pre-4igp4kt5ixygqjvctksj47-608257159943.asia-east1.run.app)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 🚀 **Live Prototype Demo:** [https://ais-pre-4igp4kt5ixygqjvctksj47-608257159943.asia-east1.run.app](https://ais-pre-4igp4kt5ixygqjvctksj47-608257159943.asia-east1.run.app)

**WeatherGPT** is a production-ready, hyper-local precision agricultural weather intelligence and AI agronomy advisory platform built for Indian farmers and agricultural practitioners. Powered by modern meteorology APIs (Open-Meteo, IMD standards) and Gemini AI models via Google Gen AI SDK.

---


## 🌟 Key Features

1. **🌾 Today's 3 Field Decisions (आज का कृषि फैसला)**
   - **🚜 Spray Suitability Window:** Real-time wind drift & Delta-T (evaporative potential) suitability windows.
   - **💧 Root-Zone Irrigation Planner:** Soil moisture depth metrics combined with Penman-Monteith reference evapotranspiration (ET₀).
   - **🌧️ Precipitation & Storm Risk:** Hourly rain probability with lodging & harvesting risk thresholds.

2. **🔴 Live Mandi Bhav Ticker (मंडी भाव)**
   - Flowing live commodity spot rates for Wheat, Soybean, Chana, Mustard, Cotton, Paddy, and Maize with day trend indicators.

3. **🎙️ Multilingual Voice Assistant (बोलकर पूछें)**
   - Supports 10 regional Indian languages (Hindi, Bhojpuri, Punjabi, Marathi, Gujarati, Bengali, Telugu, Tamil, Kannada, English) with voice recognition and text-to-speech.

4. **🌱 Crop Shield & Seasonal Pest Advisory**
   - Stage-specific pest threat warnings (Yellow Rust, Aphids, Pink Bollworm, Fall Armyworm, Pod Borer) and chemical/organic treatment recommendations.

5. **📲 1-Tap WhatsApp Bulletin Share**
   - Formats today's complete weather, spray advice, and mandi rates into an easy WhatsApp message to share with village farmer groups.

6. **📊 7-Day Agronomic Outlook & 24-Hour Radar**
   - Detailed diurnal cycles, soil telemetry, vapor pressure deficit (VPD), and fungal risk indices.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Express.js, TypeScript (`server.ts`)
- **AI & Models:** `@google/genai` (Interactions API / `gemini-2.5-flash` / `gemini-3.8-flash`)
- **Icons:** `lucide-react`
- **Charts:** Custom SVG & Tailwind responsive data visualizations

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ or v20+)
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-github-repo-url>
cd weathergpt

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your GEMINI_API_KEY in .env
```

### Running Locally

```bash
# Start development server (Frontend + Express backend proxy)
npm run dev
```

App will run on `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run start
```

---

## 📄 License

MIT License. Designed with ❤️ for Indian farmers.
