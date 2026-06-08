# AuraVerse All-in-One Financial Calculator

Welcome to the **AuraVerse All-in-One Financial Calculator** suite. This application is a fully interactive, mobile-responsive financial toolset designed to align seamlessly with the AuraVerse brand identity (featuring a premium dark-navy background, gold accents, and elegant typography).

---

## 📂 Project Structure

Here is a breakdown of the key directories and files in this repository:

```text
├── public/
│   └── logo.png                # AuraVerse brand logo
├── src/
│   ├── calculators/            # Financial calculator components
│   │   ├── loans/              # Home, Education, Business, Personal Loans
│   │   ├── investments/        # Real Estate, SIP, Mutual Funds, Fixed Deposits, PPF
│   │   ├── insurance/          # Life, General/Health Insurance
│   │   └── planning/           # Children's Education, Wealth, Retirement
│   ├── App.jsx                 # Core routing, dashboard rendering, & sidebar layouts
│   ├── index.css               # CSS variables, theme design, animations, & layouts
│   └── main.jsx                # React application mount point
├── index.html                  # HTML entry point (loads Marcellus & Inter fonts)
├── package.json                # Project dependencies and scripts
└── vite.config.js              # Vite bundler configuration
```

---

## ⚡ Core Features

### 1. Dynamic Landing Dashboards
Instead of loading a blank page, the application features four dynamic dashboard pages—one for each major financial services category:
*   🏦 **Loans** (`Loans Dashboard`)
*   📈 **Investments** (`Investments Dashboard`)
*   🔒 **Insurance** (`Insurance Dashboard`)
*   🎯 **Financial Planning** (`Planning Dashboard`)

Each dashboard features a premium summary of the category (written in Marcellus typography), followed by a grid of glassmorphic cards representing individual calculators. Hovering over a card activates micro-animations (lift transformations, gold glows, and button indicators).

### 🔗 2. Intelligent Deep-Link Routing
The app implements a lightweight routing system in [App.jsx](src/App.jsx) that listens to window `hashchange` and `popstate` events. This allows you to link directly to any specific dashboard or individual calculator from buttons on your main website.

It checks the URL in order of priority:
1.  **URL Hash**: E.g., `#/loans` or `#/mutual-funds` (Recommended for static file hosts)
2.  **Query Parameter**: E.g., `?page=loans` or `?calc=sip`
3.  **Pathname**: E.g., `/loans` or `/home-loan`

### 🧭 3. Sidebar Navigation with Auto-Expansion
*   **Header Clicks**: Clicking on category headers in the sidebar (e.g. **Loans**) opens that category's dashboard and toggles the accordion sub-items.
*   **Active States**: The currently active dashboard category header gets a gold left-border, gold color, and a subtle glowing backdrop.
*   **Auto-Expand**: When landing directly on a deep link, the sidebar automatically expands that category's accordion list so the customer always has context.

---

## 🚀 How to Integrate with your Main Website

You can place buttons on your main AuraVerse website that link directly to different views of this calculator suite:

### Category Dashboard Links
*   **Loans Dashboard**: `https://yourdomain.com/#/loans` (or `#/loan`)
*   **Investments Dashboard**: `https://yourdomain.com/#/investments` (or `#/investment`)
*   **Insurance Dashboard**: `https://yourdomain.com/#/insurance`
*   **Planning Dashboard**: `https://yourdomain.com/#/planning` (or `#/financial-planning`)

### Individual Calculator Direct Links
*   **Home Loan**: `https://yourdomain.com/#/home-loan`
*   **SIP Calculator**: `https://yourdomain.com/#/sip`
*   **Mutual Funds**: `https://yourdomain.com/#/mutual-funds`
*   **Retirement Planning**: `https://yourdomain.com/#/retirement`
*(Refer to the IDs in `CATEGORIES` within [App.jsx](src/App.jsx) for all target hashes).*

---

## 🛠️ Development & Deployment Commands

Run these commands in the project directory:

### Run Development Server
```bash
npm run dev
```
Starts Vite's local dev server (usually at `http://localhost:5173/Auraverse-Finance-Calculator/`). Features Hot Module Replacement (HMR).

### Compile Production Build
```bash
npm run build
```
Compiles a highly optimized production bundle inside the `dist/` directory.

### Preview Production Build Locally
```bash
npm run preview
```
Runs a local web server pointing to the built production files to test performance prior to hosting.
