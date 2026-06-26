from flask import request


def get_json_body() -> dict:
    """Return request JSON as a dict, or raise ValueError for a 400 response."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError("JSON inválido o ausente")
    return data
