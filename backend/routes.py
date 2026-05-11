from flask import request, jsonify
from models import User, Permission, db
from auth import generate_otp, create_jwt, permission_required, OTP_STORE
from werkzeug.security import generate_password_hash, check_password_hash
import re

EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
PK_PHONE_REGEX = r"^(\+92|0)?3\d{9}$"
PASSWORD_REGEX = (
    r"^(?=.*[0-9])(?=.*[!@#$%^&*()_\-+=?])[A-Za-z0-9!@#$%^&*()_\-+=?]{8,20}$"
)


def register_routes(app):

    # ---------------- LOGIN ----------------
    @app.route("/login", methods=["POST"])
    def login():
        email = request.json.get("email")
        password = request.json.get("password")

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"msg": "Invalid email", "error": "email"}), 404

        if not check_password_hash(user.password, password):
            return jsonify({"msg": "Invalid password", "error": "password"}), 401

        generate_otp(email)
        return jsonify({"msg": "OTP sent"})

    # ---------------- VERIFY OTP ----------------
    @app.route("/verify-otp", methods=["POST"])
    def verify_otp():
        email = request.json.get("email")
        otp = request.json.get("otp")

        if OTP_STORE.get(email) != otp:
            return jsonify({"msg": "Invalid OTP"}), 400

        user = User.query.filter_by(email=email).first()
        token = create_jwt(user)

        return jsonify(
            {
                "token": token,
                "role": user.role,
                "permissions": [p.name for p in user.permissions],
            }
        )

    # ---------------- USERS ----------------
    @app.route("/users", methods=["GET"])
    @permission_required("View Users")
    def get_users():
        users = User.query.all()
        return jsonify(
            [
                {
                    "id": u.id,
                    "first_name": u.first_name,
                    "last_name": u.last_name,
                    "email": u.email,
                    "phone": u.phone,
                    "role": u.role,
                    "permissions": [p.name for p in u.permissions],
                }
                for u in users
            ]
        )

    @app.route("/users", methods=["POST"])
    @permission_required("Create Users")
    def create_user():
        data = request.json

        if not re.match(EMAIL_REGEX, data["email"]):
            return jsonify({"msg": "Invalid email format"}), 400

        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"msg": "Email already exists"}), 400

        password = data["password"]
        if not re.match(PASSWORD_REGEX, password):
            return (
                jsonify(
                    {
                        "msg": "Password must be 8-20 characters and include at least one number and one special character"
                    }
                ),
                400,
            )
        if not re.match(PK_PHONE_REGEX, data["phone"]):
            return jsonify({"msg": "Invalid phone number"}), 400

        hashed_password = generate_password_hash(password)

        user = User(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            phone=data["phone"],
            password=hashed_password,
            role="user",
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({"msg": "User created successfully"})

    @app.route("/users/<int:id>", methods=["DELETE"])
    @permission_required("Delete Users")
    def delete_user(id):
        user = User.query.get(id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({"msg": "User deleted"})

    # ---------------- PERMISSIONS ----------------
    @app.route("/permissions/assign", methods=["POST"])
    @permission_required("Assign Permission")
    def assign_permissions():
        data = request.json
        user = User.query.get(data["user_id"])

        user.permissions = []
        for p_name in data["permissions"]:
            perm = Permission.query.filter_by(name=p_name).first()
            if perm:
                user.permissions.append(perm)

        db.session.commit()
        return jsonify({"msg": "Permissions updated"})

    @app.route("/permissions/<int:user_id>", methods=["GET"])
    @permission_required("Assign Permission")
    def get_user_permissions(user_id):
        user = User.query.get(user_id)
        return jsonify({"permissions": [p.name for p in user.permissions]})
