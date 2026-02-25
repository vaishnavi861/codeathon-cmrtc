import json
import hashlib
import os

USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")

def _load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return {}

def _save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def _hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def signup(name, email, password):
    """Register a new user. Returns (success, message)."""
    users = _load_users()
    if email in users:
        return False, "An account with this email already exists."
    users[email] = {
        "name": name,
        "email": email,
        "password_hash": _hash_password(password),
    }
    _save_users(users)
    return True, "Account created successfully!"

def login(email, password):
    """Authenticate a user. Returns (success, user_data | error_message)."""
    users = _load_users()
    if email not in users:
        return False, "No account found with this email."
    if users[email]["password_hash"] != _hash_password(password):
        return False, "Incorrect password."
    return True, users[email]

def get_user(email):
    """Get user data by email."""
    users = _load_users()
    return users.get(email)
