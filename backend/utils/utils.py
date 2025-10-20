from datetime import datetime
FMT = "%d/%m/%Y"

def normalize_dni(value: str):
    if not value:
        return value
    return value.strip().upper()

def to_float_or_none(s):
    try:
        return float(s) if s is not None else None
    except (TypeError, ValueError):
        return None
    
def to_int_or_none(s):
    try:
        return int(s) if s is not None else None
    except (TypeError, ValueError):
        return None
    
def to_str_or_none(s):
    try:
        return str(s) if s is not None else None
    except (TypeError, ValueError):
        return None

def to_bool_or_none(s):
    try:
        if s is None:
            return None
        if isinstance(s, bool):
            return s
        s_lower = str(s).strip().lower()
        if s_lower in ['true', '1', 'yes']:
            return True
        elif s_lower in ['false', '0', 'no']:
            return False
        else:
            return None
    except (TypeError, ValueError):
        return None
    
def is_valid_email(email: str) -> bool:
    import re
    if not email:
        return False
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def is_valid_phone(phone: str) -> bool:
    import re
    if not phone:
        return False
    phone_regex = r'^\+?[0-9\s\-()]{7,15}$'
    return re.match(phone_regex, phone) is not None

# app/utils/validators.py

def _parse(d: str):
    return datetime.strptime(d, FMT).date()

def validate_offer_simple(data: dict) -> tuple[bool, str]:
    required = [
        "provider_dni", "title", "description", "price",
        "people_included", "available_from", "available_to", "daily_capacity"
    ]
    missing = [k for k in required if k not in data]
    if missing:
        return False, f"Faltan campos requeridos: {missing}"

    try:
        float(data["price"])
        int(data["people_included"])
        int(data["daily_capacity"])
    except Exception:
        return False, "price debe ser número; people_included y daily_capacity enteros"

    try:
        f = _parse(data["available_from"])
        t = _parse(data["available_to"])
        if f > t:
            return False, "available_from no puede ser posterior a available_to"
    except Exception:
        return False, "Las fechas deben tener formato DD/MM/AAAA"

    return True, ""
