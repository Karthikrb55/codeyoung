import os

dirs = [
    "app/api/routes",
    "app/core",
    "app/models",
    "app/schemas",
    "app/services",
    "app/repositories",
    "tests"
]

files = [
    "app/__init__.py",
    "app/api/__init__.py",
    "app/api/routes/__init__.py",
    "app/core/__init__.py",
    "app/models/__init__.py",
    "app/schemas/__init__.py",
    "app/services/__init__.py",
    "app/repositories/__init__.py",
    "tests/__init__.py"
]

for d in dirs:
    os.makedirs(d, exist_ok=True)
for f in files:
    open(f, 'w').close()

print("Directories and __init__.py files created successfully.")
