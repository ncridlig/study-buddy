import websocket
import json

ACCESS_TOKEN = ""  # Replace with a real JWT
WS_URL = "ws://localhost/ws/task/status/"  # Adjust host/port as needed

def on_message(ws, message):
    data = json.loads(message)
    print("📨 Received:", data)

def on_error(ws, error):
    print("❌ Error:", error)

def on_close(ws, close_status_code, close_msg):
    print(f"🔌 Connection closed (code={close_status_code}, msg={close_msg})")

def on_open(ws):
    print("🔗 Connected to WebSocket.")

headers = {
    "Cookie": f"access_token={ACCESS_TOKEN}"
}

ws = websocket.WebSocketApp(
    WS_URL,
    header=[f"{k}: {v}" for k, v in headers.items()],
    on_message=on_message,
    on_error=on_error,
    on_close=on_close,
    on_open=on_open
)

print("📡 Connecting...")
ws.run_forever()
