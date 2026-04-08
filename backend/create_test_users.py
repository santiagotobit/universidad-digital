#!/usr/bin/env python3
"""
Script para crear usuarios de prueba en la base de datos.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.database import engine, init_db
from app.users.services import create_user, assign_role
from app.users.schemas import UserCreate
from app.roles.services import create_role
from app.roles.schemas import RoleCreate
from app.roles.models import Role

def get_or_create_role(db, name: str, description: str) -> Role:
    """Obtiene un rol por nombre o lo crea si no existe."""
    role = db.scalar(select(Role).where(Role.name == name))
    if role:
        return role
    return create_role(db, RoleCreate(name=name, description=description))

def create_test_users():
    """Crear usuarios de prueba."""
    # Inicializar la base de datos (importar modelos)
    init_db()
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Crear roles si no existen
        admin_role = get_or_create_role(db, "Administrador", "Administrador del sistema")
        teacher_role = get_or_create_role(db, "Docente", "Docente")
        student_role = get_or_create_role(db, "Estudiante", "Estudiante")

        # Crear usuarios de prueba
        users_data = [
            {
                "email": "admin@test.com",
                "full_name": "Administrador",
                "password": "password123",
                "role": admin_role
            },
            {
                "email": "teacher@test.com",
                "full_name": "Docente de Prueba",
                "password": "password123",
                "role": teacher_role
            },
            {
                "email": "student@test.com",
                "full_name": "Estudiante de Prueba",
                "password": "password123",
                "role": student_role
            }
        ]

        for user_data in users_data:
            try:
                user_create = UserCreate(
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    password=user_data["password"]
                )
                user = create_user(db, user_create)
                assign_role(db, user.id, user_data["role"].id)
                print(f"✓ Usuario creado: {user.email} ({user_data['role'].name})")
            except Exception as e:
                print(f"⚠️ Usuario ya existe o error: {user_data['email']} - {e}")

        db.commit()
        print("\n✅ Usuarios de prueba creados exitosamente!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creando usuarios: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()