<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🚀 Stellar Pay

**A modern, secure XLM payment application built on the Stellar Testnet**

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue?logo=stellar&logoColor=white)](https://stellar.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📖 About

Stellar Pay is a decentralized payment application that allows users to send and receive **XLM (Lumens)** on the **Stellar Testnet**. It connects to the **Freighter Wallet** browser extension for secure transaction signing — your private keys never leave your wallet.

Built with a modern tech stack featuring React 19, Vite, TypeScript, and Tailwind CSS, with smooth animations powered by Motion.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **Wallet Connection** | Connect securely via Freighter browser extension |
| 💸 **Send XLM** | Send Lumens to any Stellar Testnet address |
| 💰 **Balance Display** | Real-time XLM balance with one-click refresh |
| 🏦 **Friendbot Funding** | Fund your testnet wallet with 10,000 free XLM |
| 🔐 **Non-Custodial** | Private keys stay in your Freighter wallet |
| 🌐 **Transaction Explorer** | View transactions on Stellar Expert |
| 📖 **How-to-Use Guide** | Built-in step-by-step usage instructions |
| 🎨 **Modern UI** | Dark theme with smooth animations |

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Blockchain:** Stellar SDK 13
- **Wallet:** Freighter API v6
- **Network:** Stellar Testnet (Horizon)

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js** (v18 or higher)
- ✅ **npm** (comes with Node.js)
- ✅ **Freighter Wallet** — [Install from freighter.app](https://www.freighter.app/)
- ✅ A **Stellar Testnet account** in Freighter

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stellar-pay.git
cd stellar-pay
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Copy the example env file and add your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your values:

```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### 5. Build for Production

```bash
npm run build
npm run preview
```

---

## 📝 How to Use

Follow these steps to send your first payment:

### Step 1 — Install Freighter Wallet
Install the [Freighter Wallet](https://www.freighter.app/) browser extension and create an account.

### Step 2 — Switch to Testnet
Open Freighter → Settings → Network → Select **Stellar Testnet**.

### Step 3 — Connect Wallet
Click **"Connect Wallet"** in the app. Approve the connection in the Freighter popup.

### Step 4 — View Your Balance
Once connected, your wallet address and XLM balance will appear on the dashboard.

### Step 5 — Fund Your Wallet (Optional)
If your balance is 0, click **"Fund with Friendbot"** to receive **10,000 free testnet XLM** from the [Stellar Friendbot](https://friendbot.stellar.org).

### Step 6 — Send Payment
1. Enter the recipient's Stellar Testnet address (starts with `G`)
2. Enter the amount of XLM to send
3. Click **"Send XLM"**

### Step 7 — Confirm Transaction
Approve the transaction in the Freighter popup. You'll see:
- ✅ **Success message** with a link to view on [Stellar Expert](https://stellar.expert/explorer/testnet)
- ❌ **Error message** if something goes wrong (e.g., insufficient funds)

---

## 📁 Project Structure

```
stellar-pay/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML entry point
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── .env.example         # Environment variables template
└── README.md            # This file
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run clean` | Remove the `dist/` folder |
| `npm run lint` | Run TypeScript type checking |

---

## 🌐 Stellar Network Details

| Property | Value |
|----------|-------|
| **Network** | Stellar Testnet |
| **Horizon URL** | `https://horizon-testnet.stellar.org` |
| **Friendbot** | `https://friendbot.stellar.org` |
| **Explorer** | [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) |
| **Base Fee** | 100 stroops (0.00001 XLM) |

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Freighter wallet not found"** | Install the [Freighter extension](https://www.freighter.app/) and reload the page |
| **"Could not retrieve public key"** | Unlock Freighter and ensure you have an account created |
| **Balance shows 0** | Click "Fund with Friendbot" to get free testnet XLM |
| **Transaction failed** | Check that the recipient address is valid and starts with `G` |
| **Popup not appearing** | Allow popups for the site and check Freighter is unlocked |

---

## 🔗 Useful Links

- 🌟 [Stellar Documentation](https://developers.stellar.org/)
- 🔑 [Freighter Wallet](https://www.freighter.app/)
- 🧪 [Stellar Testnet Friendbot](https://friendbot.stellar.org)
- 🔍 [Stellar Expert Explorer](https://stellar.expert/explorer/testnet)
- 🏛️ [Stellar Foundation](https://stellar.org/foundation)

---

## ⚠️ Disclaimer

> This application is built for the **Stellar Testnet** only. Testnet XLM has no real monetary value. Do not use this application with Mainnet credentials or real funds without proper security audits.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for the Stellar ecosystem**

[Stellar](https://stellar.org) • [Freighter](https://freighter.app) • [React](https://react.dev)

</div>
