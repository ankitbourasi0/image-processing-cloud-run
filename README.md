# Image Converter

This project is an image converter application that includes both a frontend and a backend. The frontend is built with Next.js 14, and the backend is built with FastAPI.
## Live URL
- https://image-processing-cloud-run.vercel.app/

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Frontend](#running-the-frontend)
- [Running the Backend](#running-the-backend)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)


## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [Python](https://www.python.org/) (version 3.7 or higher)
- [pip](https://pip.pypa.io/en/stable/)

## Installation

### Frontend

1. Navigate to the `image-converter` directory:

    ```sh
    cd image-converter
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

### Backend

1. Navigate to the `image-converter-backend` directory:

    ```sh
    cd image-converter/image-converter-backend
    ```

2. Create a virtual environment and activate it:

    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the dependencies:

    ```sh
    pip install -r requirements.txt
    ```

## Running the Frontend

1. Navigate to the `image-converter` directory if you are not already there:

    ```sh
    cd image-converter
    ```

2. Start the development server:

    ```sh
    npm run dev
    ```

3. Open your browser and go to `http://localhost:3000`.

## Running the Backend

1. Navigate to the `image-converter-backend` directory if you are not already there:

    ```sh
    cd image-converter/image-converter-backend
    ```

2. Start the FastAPI server:

    ```sh
    python main.py
    ```

    ```sh
    uvicorn main:app --reload
    ```



3. The backend will be running at `http://localhost:8000`.

## Environment Variables 

Create a `.env.local` file in the `image-converter` directory to set up your environment variables for the frontend. For the backend, you can create a `.env` file in the `image-converter-backend` directory.

### Example `.env.local` for Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
