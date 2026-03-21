#!/bin/bash
# Test prospect import API (run after backend restart)
# Usage: ./test_prospect_import.sh

set -e
BASE="${REACT_APP_API_URL:-http://localhost:8000}"

echo "1. Preview CSV..."
PREVIEW=$(curl -s -X POST "$BASE/api/prospect-import/preview" \
  -H "Content-Type: application/json" \
  -d '{"csv_text": "Contact Name,Email,Organizations\nSteven Cohen,steven@x.com,\"Point72; Cohen Foundation\"\nJane Smith,jane@acme.org,Acme Inc"}')
echo "$PREVIEW" | python3 -m json.tool
if echo "$PREVIEW" | grep -q '"headers"'; then
  echo "   OK: Preview works"
else
  echo "   FAIL: Preview failed. Restart backend: cd financial_forecasting && python main.py"
  exit 1
fi

echo ""
echo "2. Parse with column mapping..."
PARSE=$(curl -s -X POST "$BASE/api/prospect-import/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "csv_text": "Contact Name,Email,Organizations\nSteven Cohen,steven@x.com,\"Point72; Cohen Foundation\"\nJane Smith,jane@acme.org,Acme Inc",
    "column_mapping": {"name": "Contact Name", "email": "Email", "organizations": ["Organizations"]},
    "filename": "test.csv"
  }')
echo "$PARSE" | python3 -m json.tool
if echo "$PARSE" | grep -q '"session_id"'; then
  SESSION=$(echo "$PARSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('session_id',''))")
  echo "   OK: Parse works, session=$SESSION"
else
  echo "   FAIL: Parse failed"
  exit 1
fi

echo ""
echo "3. Get persons..."
PERSONS=$(curl -s "$BASE/api/prospect-import/persons?session_id=$SESSION")
echo "$PERSONS" | python3 -m json.tool
if echo "$PERSONS" | grep -q '"persons"'; then
  echo "   OK: Persons retrieved"
else
  echo "   FAIL: Get persons failed"
  exit 1
fi

echo ""
echo "All tests passed. Open http://localhost:3000/prospect-import to test in the UI."
