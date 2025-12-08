import requests
import sys

BASE_URL = "http://localhost:8000/api"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def test_api():
    # 1. Health Check (Root)
    print_step("Checking User Registration")
    
    # Randomize email to allow repeated runs
    import random
    rand_int = random.randint(1000, 9999)
    email = f"testUser{rand_int}@example.com"
    password = "password123"

    # Register
    reg_payload = {"email": email, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
        if resp.status_code == 201:
            print(f"✅ Register success: {resp.json()}")
        elif resp.status_code == 400 and "already registered" in resp.text:
             print("ℹ️ User already exists (handling gracefully)")
        else:
            print(f"❌ Register failed: {resp.status_code} - {resp.text}")
            return
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # Login
    print_step("Checking Login")
    login_payload = {"username": email, "password": password} # OAuth2 uses form data 'username'
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
    if resp.status_code == 200:
        token_data = resp.json()
        print(f"✅ Login success. Token received.")
        access_token = token_data["access_token"]
    else:
        print(f"❌ Login failed: {resp.status_code} - {resp.text}")
        return

    headers = {"Authorization": f"Bearer {access_token}"}

    # Me
    print_step("Checking /me Endpoint")
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if resp.status_code == 200:
        print(f"✅ /me success: {resp.json()}")
    else:
        print(f"❌ /me failed: {resp.status_code} - {resp.text}")

    # Create Expense
    print_step("Checking Create Expense")
    exp_payload = {
        "date": "2023-10-27",
        "amount": 50.50,
        "description": "Lunch test",
        # category_id optional
    }
    resp = requests.post(f"{BASE_URL}/expenses/", json=exp_payload, headers=headers)
    if resp.status_code == 201:
        print(f"✅ Expense created: {resp.json()}")
    else:
        print(f"❌ Expense creation failed: {resp.status_code} - {resp.text}")

    # List Expenses
    print_step("Checking List Expenses")
    resp = requests.get(f"{BASE_URL}/expenses/", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Listed {len(data)} expenses.")
    else:
        print(f"❌ List expenses failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    test_api()
