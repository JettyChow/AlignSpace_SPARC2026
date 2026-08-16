from app.services import auth_service


CURRENT_USER_ID = "mock-user-1"

VALID_ROLES = ["client", "designer", "admin"]

users = {
    CURRENT_USER_ID: {
        "user_id": CURRENT_USER_ID,
        "clerk_user_id": None,
        "email": None,
        "first_name": None,
        "last_name": None,
        "display_name": "Local Mock User",
        "role": None,
        "firm_id": "firm_default",
        "auth_source": "mock",
    }
}


def get_current_user(request=None):
    current_user = auth_service.current_user_from_request(request)
    if current_user["auth_source"] != "mock":
        users.setdefault(current_user["user_id"], current_user)
        users[current_user["user_id"]].update({
            key: value for key, value in current_user.items() if value is not None
        })
        return users[current_user["user_id"]]

    return users[CURRENT_USER_ID]


def update_user_role(role: str, request=None):
    if role not in VALID_ROLES:
        return {"error": "Invalid role"}

    current_user = get_current_user(request)
    users[current_user["user_id"]]["role"] = role

    return {
        **users[current_user["user_id"]],
        "role": role,
    }
