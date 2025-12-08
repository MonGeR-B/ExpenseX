import requests
import sys

API_URL = "http://localhost:8000/api"
EMAIL = "agent_verify_04@example.com"
PASSWORD = "password123"

def run_test():
    # 1. Login
    print("[TEST] Logging in...")
    login_resp = requests.post(f"{API_URL}/auth/login", data={"username": EMAIL, "password": PASSWORD})
    if login_resp.status_code != 200:
        print(f"[FAIL] Login failed: {login_resp.text}")
        sys.exit(1)
    
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Login successful. Token acquired.")

    # 2. Add Expense
    print("[TEST] Adding expense...")
    expense_data = {
        "amount": 550.00,
        "description": "Manual Verification Lunch",
        "date": "2025-10-27"
    }
    create_resp = requests.post(f"{API_URL}/expenses/", json=expense_data, headers=headers)
    if create_resp.status_code != 201: # Assuming 200 or 201
         # Start fetching to see if it was created anyway or what
        print(f"[FAIL] Create expense failed: {create_resp.text}")
        sys.exit(1)
    
    print("[PASS] Expense added.")

    # 3. Fetch Expenses
    print("[TEST] Fetching expenses...")
    list_resp = requests.get(f"{API_URL}/expenses/?limit=5", headers=headers)
    if list_resp.status_code != 200:
        print(f"[FAIL] List expenses failed: {list_resp.text}")
        sys.exit(1)
    
    expenses = list_resp.json()
    found = any(e['description'] == "Manual Verification Lunch" for e in expenses)
    
    if found:
        print(f"[PASS] Verified 'Manual Verification Lunch' is in the list. Total expenses: {len(expenses)}")
    else:
        print(f"[FAIL] Expense not found in list. Content: {expenses}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
