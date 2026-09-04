FROM python:3.10-slim

# Install system dependencies required for Computer Vision (OpenCV) and OCR (Tesseract)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the backend requirements file
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend codebase into /app/backend
# (We structure it this way so the imports in backend work properly if it's treated as a module,
# OR we can just copy the whole repo and run it from /app/backend)
COPY . /app

# Set the working directory to the backend folder where main.py lives
WORKDIR /app/backend

# Hugging Face Spaces expose port 7860
ENV PORT=7860
EXPOSE 7860

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
