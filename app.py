from backend import create_app
from backend.config import Config

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host=Config.FLASK_HOST, port=Config.FLASK_PORT)
