
# ScaphoidAI Fracture Estimator

A clinical decision support tool estimating the probability of scaphoid fractures using AI.

## 🚀 Running the Web Application (React)

This project contains a modern React application powered by Google Gemini AI.

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the development server**:
    ```bash
    npm start
    ```

## 🐍 Running the Python/Streamlit Version

If you prefer the Python Machine Learning version (as requested for the class project):

1.  **Locate the file**: Use `streamlit_app.py` located in the root directory.
2.  **Install Python requirements**:
    ```bash
    pip install streamlit pandas numpy scikit-learn joblib
    ```
3.  **Run locally**:
    ```bash
    streamlit run streamlit_app.py
    ```

## ☁️ Deploying to Streamlit Cloud

1.  Create a new repository on GitHub.
2.  Upload `streamlit_app.py`.
3.  Create a `requirements.txt` file with the following content:
    ```
    streamlit
    pandas
    numpy
    scikit-learn
    joblib
    ```
4.  Go to [share.streamlit.io](https://share.streamlit.io), connect your GitHub, and deploy!
