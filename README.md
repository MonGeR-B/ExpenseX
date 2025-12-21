# ExpenseX 💸

**ExpenseX** is a modern, cross-platform financial operating system designed to track expenses, manage budgets, and visualize spending habits. Built with an "Offline-First" architecture, it ensures you never lose data even without an internet connection.

## 🚀 Key Features

-   **Offline-First**: Adding expenses works 100% offline. Data syncs automatically when online.
-   **Cross-Platform**: Run on Android, iOS, and Web (Next.js) from a single codebase.
-   **Smart Analytics**: Weekly and Monthly spending trends with interactive charts.
-   **Secure Auth**: JWT-based authentication with `SecureStore` (Mobile) and `localStorage` (Web).
-   **Premium UI**: Glassmorphism design, smooth animations, and a "Bento-style" dashboard.

## 🛠️ Tech Stack

-   **Backend**: Python (FastAPI), SQLAlchemy, SQLite
-   **Mobile**: React Native (Expo), NativeWind (Tailwind), Reanimated
-   **Web**: Next.js (React), Tailwind CSS
-   **State Management**: React Context + Optimistic Sync

## 📦 Installation & Setup

### Prerequisites
-   Python 3.10+
-   Node.js 18+
-   Expo Go (on your phone)

### 1. Backend Setup (The Brain)
The backend handles the database and API logic.

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Your API is now running at `http://localhost:8000` (or `http://YOUR_IP:8000`).*

### 2. Mobile Setup (The App)
Step-by-step to run on your phone.

```bash
cd mobile
npm install

# Run on Android Emulator or Physical Device
npx expo start --clear
```
-   Scan the QR code with **Expo Go**.
-   Ensure your phone and PC are on the **same Wi-Fi**.

### 3. Web Setup (Optional Dashboard)
A responsive web view of your data.

```bash
cd web
npm install
npm run dev
```

## 📱 Offline Architecture
ExpenseX uses a **Stale-While-Revalidate** strategy:
1.  **Read**: Data loads instantly from local `AsyncStorage`. Background fetch updates it.
2.  **Write**: "Add Expense" is optimistic. Updates UI immediately.

## 🤝 Contributing
1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
*Built with ❤️ by Antigravity*
