# Mock current user for prototype.
# Later this will be replaced by Clerk token verification + database lookup.
CURRENT_USER_ID = "mock-user-1"

VALID_ROLES = ["client", "designer", "admin"]

users = {
    CURRENT_USER_ID: {
        "user_id": CURRENT_USER_ID,
        "role": None,
        "firm_id": None
    }
}


def get_current_user():
    return users[CURRENT_USER_ID]


def update_user_role(role: str):
    if role not in VALID_ROLES:
        return {"error": "Invalid role"}

    users[CURRENT_USER_ID]["role"] = role

    return {
        "role": role
    }