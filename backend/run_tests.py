#!/usr/bin/env python3
"""
Script para ejecutar tests del sistema Universidad Digital.

Uso:
    python run_tests.py                # Todos los tests
    python run_tests.py --unit         # Solo unit tests
    python run_tests.py --integration  # Solo integration
    python run_tests.py --e2e          # Solo e2e
    python run_tests.py --coverage     # Con reporte de cobertura
"""

import subprocess
import sys
import argparse

def run_command(command, description):
    """Ejecuta un comando y muestra el resultado."""
    print(f"\n{'='*50}")
    print(f"Ejecutando: {description}")
    print('='*50)

    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error ejecutando {description}:")
        print(e.stdout)
        print(e.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Ejecutar tests del sistema")
    parser.add_argument("--unit", action="store_true", help="Solo tests unitarios")
    parser.add_argument("--integration", action="store_true", help="Solo tests de integración")
    parser.add_argument("--e2e", action="store_true", help="Solo tests e2e")
    parser.add_argument("--coverage", action="store_true", help="Incluir reporte de cobertura")

    args = parser.parse_args()

    # Cambiar al directorio backend si no estamos ya ahí
    import os
    if not os.path.exists("tests"):
        os.chdir("backend")

    # Configurar PYTHONPATH
    os.environ['PYTHONPATH'] = os.getcwd()

    # Comando base
    cmd = "pytest"

    # Filtros
    if args.unit:
        cmd += " -m unit"
    elif args.integration:
        cmd += " -m integration"
    elif args.e2e:
        cmd += " -m e2e"

    # Cobertura
    if args.coverage or not any([args.unit, args.integration, args.e2e]):
        cmd += " --cov=app --cov-report=term-missing --cov-report=html:htmlcov"

    # Ejecutar
    success = run_command(cmd, "Tests del Sistema Universidad Digital")

    if success:
        print("\n✅ Todos los tests pasaron exitosamente!")
    else:
        print("\n❌ Algunos tests fallaron. Revisa los errores arriba.")
        sys.exit(1)

if __name__ == "__main__":
    main()