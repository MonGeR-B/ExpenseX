from app.core.security import hash_password, verify_password

try:
    print("Hashing 'password123'...")
    hashed = hash_password("password123")
    print(f"Hash: {hashed}")
    
    print("Verifying 'password123'...")
    valid = verify_password("password123", hashed)
    print(f"Valid: {valid}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
