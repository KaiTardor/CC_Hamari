from backend import create_app
from backend.config import Config

app = create_app()

if __name__ == "__main__":
    app.run(debug=Config.FLASK_DEBUG, host=Config.FLASK_HOST, port=Config.FLASK_PORT)
