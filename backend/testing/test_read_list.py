import requests
import os

# Base URL for the API
BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")


def test_add_book_to_reading_list():
    unique_id = "OL262496W" #Sherlock Holmes: A Study in Scarlet
    book_data = {
        "external_id": f"{unique_id}",
        "title": "A Study in Scarlet",
        "description": None,
        "author": "Arthur Conan Doyle",
        "cover_i": 13405534
    }

    response = requests.post(f"{BASE_URL}/api/reading-list/", json=book_data)
    print(response.json())
    assert response.status_code == 201

    data = response.json()
    assert data["book_external_id"] == book_data["external_id"]
    assert data["title"] == book_data["title"]
    assert data["author"] == book_data["author"]
    assert data["status"] == "PLANNED"
    print("✓ test_add_book_to_reading_list passed")


def test_add_duplicate_book_does_not_create_duplicates():
    unique_id = "OL81613W" #It🤡
    book_data = {
        "external_id": f"{unique_id}",
        "title": "It",
        "description": "A scary scary book about a clown.",
        "author": "Stephen King",
        "cover_i": 67890
    }

    #First add
    response1 = requests.post(f"{BASE_URL}/api/reading-list/", json=book_data)
    assert response1.status_code == 201
    first_book = response1.json()

    #Second add
    response2 = requests.post(f"{BASE_URL}/api/reading-list/", json=book_data)
    assert response2.status_code == 201
    second_book = response2.json()

    #Should be the ID
    assert first_book["id"] == second_book["id"]
    assert first_book["book_external_id"] == second_book["book_external_id"]
    print("✓ test_add_duplicate_book_does_not_create_duplicates passed")


def test_update_reading_status():
    unique_id = "OL52114W"
    book_data = {
        "external_id": f"{unique_id}",
        "title": "The War of the Worlds",
        "description": "A book about big mean aliens invading Earth.",
        "author": "H. G. Wells",
        "cover_i": 15088491
    }

    #Remove if exists
    existing = requests.get(f"{BASE_URL}/api/reading-list/")
    for entry in existing.json():
        if entry["book_external_id"] == unique_id:
            requests.delete(f"{BASE_URL}/api/reading-list/{entry['id']}")

    #Add book first
    add_response = requests.post(f"{BASE_URL}/api/reading-list/", json=book_data)
    assert add_response.status_code == 201
    book = add_response.json()
    book_id = book["id"]

    #Check if initial status is PLANNED
    assert book["status"] == "PLANNED"

    #Update status
    update_data = {"status": "READING"}
    update_response = requests.put(f"{BASE_URL}/api/reading-list/{book_id}", json=update_data)
    assert update_response.status_code == 200
    updated_book = update_response.json()
    assert updated_book["status"] == "READING"

    #Update status to DONE
    update_data = {"status": "DONE"}
    update_response = requests.put(f"{BASE_URL}/api/reading-list/{book_id}", json=update_data)
    assert update_response.status_code == 200
    updated_book = update_response.json()
    assert updated_book["status"] == "DONE"
    print("✓ test_update_reading_status passed")


def run_tests():
    """Run all tests and report results."""
    tests = [
        test_add_book_to_reading_list,
        test_add_duplicate_book_does_not_create_duplicates,
        test_update_reading_status
    ]

    passed = 0
    failed = 0

    print("Running BookOn API Tests...")
    print("=" * 40)

    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"✗ {test.__name__} failed: {e}")
            failed += 1

    print("=" * 40)
    print(f"Results: {passed} passed, {failed} failed")

    if failed == 0:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1


if __name__ == "__main__":
    exit(run_tests())