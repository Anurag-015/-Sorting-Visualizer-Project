# Sorting Visualizer DSA Project

## 📌 Overview

The **Sorting Visualizer DSA Project** is an interactive web-based platform built with **Flask (Python backend)** and **HTML/CSS/JavaScript (frontend)**. It helps students, developers, and interviewees understand sorting algorithms through engaging visualizations, interactive learning, and gamified challenges.

This project supports two main modes:

### 🎮 Game Mode

* Select multiple algorithms (Bubble, Insertion, Selection, Merge, Quick, Heap, etc.).
* Race algorithms side by side with animations (bars, balls, cards, planets, etc.).
* Enter a custom array or generate a random one.
* Leaderboard: see which algorithm finishes first.
* Stats: number of comparisons, swaps, and execution time.

### 📖 Learn Mode

* Explore sorting algorithms with step-by-step animations.
* Choose **Best, Average, or Worst case** scenarios.
* Input your own array or generate random arrays.
* Control playback: Play, Pause, Step Forward, Rewind.
* Speed control slider.
* Multi-language code snippets (Python, C++, Java, JavaScript).
* Explanations in simple, easy-to-understand terms.
* Complexity table (O(n), O(n log n), O(n²)).
* Performance analytics graphs comparing algorithms.
* Hybrid algorithm demos (e.g., QuickSort vs Timsort).
* Real-world applications panel for each algorithm.

### ✨ Unique Features

* **Gamified Learning**: quizzes like *predict swaps* or *guess complexity*.
* **User-Created Algorithms**: paste your own Python sorting code and visualize it.
* **Multiple Visualization Styles**: bars, balls, cards, orbits.
* **Responsive Design**: mobile-friendly interface.
* **Educational Add-ons**: explanations, pseudocode, real-world usage.

---

## 🛠️ Tech Stack

* **Backend**: Python, Flask
* **Frontend**: HTML, CSS, JavaScript
* **Data Visualization**: Custom JS animations + Chart.js (for analytics)
* **Optional**: Flask-SocketIO for multiplayer race mode

---

## 🚀 Installation & Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/sorting-visualizer-dsa.git
   cd sorting-visualizer-dsa/SortVisualizer-1
   ```

2. Create a virtual environment & activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt   # or use pyproject.toml with poetry
   ```

4. Run the app:

   ```bash
   python app.py
   ```

5. Open in browser:

   ```
   http://127.0.0.1:5000/
   ```

---

## 📂 Project Structure

```
SortVisualizer-1/
│── app.py                # Flask entry point
│── main.py               # Alternate runner / test file
│── routes.py             # Flask routes & API endpoints
│── models.py             # Data structures / helpers
│── sorting_algorithms.py # Implemented sorting algorithms
│── templates/            # HTML files (Jinja templates)
│── static/               # CSS, JS, images
│── pyproject.toml        # Dependencies & config
│── replit.md             # Replit setup
│── .git/                 # Version control history
```

---

## 📊 Future Enhancements

Here are some features planned for the next versions of the project:

* **Multiplayer Race Mode** → Using Flask-SocketIO to let multiple users compete live.
* **More Sorting Algorithms** → Radix Sort, Bucket Sort, Counting Sort, Cocktail Shaker Sort, Shell Sort.
* **Dynamic Complexity Graphs** → Real-time complexity visualization while sorting.
* **AI Recommendations** → Suggest the most efficient algorithm based on input size and characteristics.
* **Export Options** → Save results and visualizations as PDF/PNG for reports or study material.
* **Voice-Assisted Learning** → Narrated explanations of each step for accessibility.
* **Dark Mode / Themes** → Customizable UI themes for better usability.
* **Leaderboard Persistence** → Store race results in a database for global rankings.
* **Interactive Quizzes** → Integrated mini-tests to check understanding.
* **Cloud Deployment** → Host on Heroku/AWS for easy public access.
* **Bug Fixing & Optimizations** → Continuous work on smaller bugs, UI glitches, performance improvements, and refining edge cases (like empty arrays, duplicate values, and very large inputs).
* **Accessibility Enhancements** → Keyboard shortcuts, screen reader compatibility.
* **Modular Code Editor** → In-browser editor to write and run custom algorithms.
* **Collaborative Learning Mode** → Two students can interact in real-time and learn together.
* **Sorting Challenges Mode** → Timed challenges where users must sort arrays manually and compete with algorithms.
* **Algorithm Visualization Replay** → Save and replay previous visualizations for practice.
* **Statistics Dashboard** → Track how often each algorithm is used and average performance.
* **Localization Support** → Multi-language support for global learners.
* **Plugin System** → Allow developers to add custom algorithms or visualization themes as plugins.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repo.
2. Create a new branch (`feature/your-feature-name`).
3. Commit your changes.
4. Push to your branch and open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License.



* Game Mode racing demo
* Learn Mode step-by-step visualization
* Performance comparison graphs

---

## 🙌 Acknowledgements

* Inspired by classic sorting visualizers, extended with **gamified and educational features**.
* Built to help students **learn DSA interactively** and prepare for **interviews**.
