# TomeKeeper: The Ultimate Reading Tracker

A professional, full-stack web application designed to track books, webnovels, and fanfics in one centralized, cloud-based library. Built with a focus on modular architecture and user experience.

## 🔗 Live Application
* **Primary Link:** [https://tomekeeper-app.netlify.app/](https://tomekeeper-app.netlify.app/)
* **Note:** If the primary link is temporarily unavailable, please follow the instructions below to run the application locally on your machine.

## 💻 Running Locally
If you prefer to run this project locally, or if the deployed link is unreachable, follow these steps:

1. **Prerequisites**: 
   - Ensure you have [VS Code](https://code.visualstudio.com/) installed.
   - Ensure your Java Spring Boot backend is running.

2. **Start a Local Server**:
   - The easiest way to run the frontend is using the **Live Server** extension in VS Code.
   - Open your project folder in VS Code.
   - Open `index.html`.
   - Click the **"Go Live"** button in the bottom right corner of the status bar.
   - This will start a local server that communicates correctly with your backend.

3. **Verify API Connection**:
   - Ensure your backend API is active and accessible via `http://localhost:8080/api/stories` before launching the frontend.

## 🚀 Features
* **Cloud-Integrated CRUD**: Full create, read, update, and delete operations backed by a Java Spring Boot API.
* **Modern SPA Architecture**: Modular design using dynamic HTML fetching for a seamless, fast browsing experience.
* **Smart Analytics**: Real-time dashboard calculating reading progress, completion status, and quote tracking.
* **Personalization**: Dark/Light mode support with persistence via `localStorage`.
* **Data Portability**: Dynamic export functionality allowing users to backup their library as `.csv` or `.pdf` files.
* **Responsive Design**: Fully optimized UI that adapts from widescreen monitors to mobile devices.

## 🛠️ Tech Stack
* **Frontend**: HTML5, Modern CSS (Vintage Theme), JavaScript (SPA Router).
* **Backend**: Java, Spring Boot, MongoDB Atlas.
* **Deployment**: Netlify (Frontend), Railway (Backend).
* **Libraries**: jsPDF for dynamic document generation.

## 📸 Project Architecture
This project utilizes a modular Single Page Application (SPA) design. By separating the UI into independent HTML templates and injecting them via JavaScript, the application achieves high performance and maintainability.

## 📄 License
All Rights Reserved. © 2026 Mummullage Binuri Umanda Thathsarani.
