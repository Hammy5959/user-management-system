from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

user_permissions = db.Table(
    "user_permissions",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
    db.Column("permission_id", db.Integer, db.ForeignKey("permission.id")),
)


class Permission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(15), nullable=False)

    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")

    permissions = db.relationship(
        "Permission", secondary=user_permissions, backref="users"
    )
