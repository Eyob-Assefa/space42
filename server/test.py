# Run this in a test.py file
from app.database import get_db


res = get_db().table("handbook_documents").select("content").ilike("content", "%mission%").execute()
print(f"Found {len(res.data)} rows containing the word 'mission'")