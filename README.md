# Atmosphere — Weather Generative Art

A minimalist, single-page web application that transforms live, local weather conditions into organic, generative digital art.

The page is designed with pure visual minimalism: the screen is dedicated entirely to the generative canvas, featuring only:
- A **Light / Dark mode toggle** button.
- A **GitHub icon** linking directly to your profile.

---

## ✨ Features

- **Atmospheric Data Translation**:
  - **Temperature**: Maps smoothly to chromatic warmth. Cold/freezing conditions produce crystalline cyan, cobalt, and frosty violet hues; moderate temperatures yield lush emeralds and azure tones; hot conditions summon golden amber, coral, and radiant solar crimson.
  - **Wind Speed & Direction**: Real-time vector field bias aligns particle flow to true wind velocity and meteorological direction.
  - **Precipitation & Rain**: Modulates fluid streak momentum, cascading rainfall vectors, and phosphorescent trails.
  - **Snowfall**: Generates drifting, fluttering blizzard particles.
  - **Cloud Cover**: Dynamically softens the noise frequency into atmospheric, billowy vapor.
  - **Thunderstorms**: Generates periodic subtle atmospheric lightning discharges.
- **Interactive Dynamics**:
  - Move your pointer across the canvas to interact with the flow field.
  - Click or tap anywhere to trigger generative ripples and shockwaves.
- **Pure Minimalism**:
  - Fullscreen high-DPI responsive canvas.
  - Only two controls: the theme toggle and the GitHub icon.
  - Current weather status is displayed in the browser tab title and button tooltips.
- **Zero Configuration & Free APIs**:
  - Uses the browser's `navigator.geolocation` with automatic IP-based geocoding fallback (`ipapi.co`).
  - Powered by the free Open-Meteo API (no API keys required).

---

## 🚀 GitHub Link

Configured to link directly to your profile:
`https://github.com/chimwemwe2003`

---

## 🌐 Running Locally

Simply double-click `index.html` or open it with any web server (such as VS Code Live Server or `npx serve`).
