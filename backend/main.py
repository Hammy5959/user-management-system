from flask import Flask
from flask_cors import CORS
from werkzeug.security import generate_password_hash

from config import *
from models import db, User, Permission
from routes import register_routes

app = Flask(__name__)
app.config.from_object("config")
CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()

    # Seed permissions
    default_perms = [
        "View Users",
        "Create Users",
        "Delete Users",
        "Assign Permission",
    ]

    for p in default_perms:
        if not Permission.query.filter_by(name=p).first():
            db.session.add(Permission(name=p))
    db.session.commit()

    # Seed admin
    admin = User.query.filter_by(email="hamid59@gmail.com").first()
    if not admin:
        admin = User(
            first_name="Hamid",
            last_name="Maqsood",
            email="hamid59@gmail.com",
            phone="03001234567",
            password=generate_password_hash("admin@123"),
            role="admin",
        )
        db.session.add(admin)
        db.session.commit()

    admin.permissions = Permission.query.all()
    db.session.commit()

register_routes(app)

if __name__ == "__main__":
    app.run(debug=True)
