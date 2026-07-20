import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# App directories setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Settings configuration settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
CHROMADB_PATH = os.getenv("CHROMADB_PATH", os.path.join(DATA_DIR, "chroma"))
DB_PATH = os.getenv("DB_PATH", os.path.join(DATA_DIR, "ikt_database.db"))
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
