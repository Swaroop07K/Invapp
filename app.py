
import os
import json
import mimetypes
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Ensure proper MIME types for browser module resolution
mimetypes.add_type('application/javascript', '.tsx')
mimetypes.add_type('text/css', '.css')

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default-key-for-dev-only')

def get_db_connection():
    """Establishes a connection to the AWS RDS instance."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('RDS_ENDPOINT'),
            database=os.getenv('RDS_DB_NAME'),
            user=os.getenv('RDS_USERNAME'),
            password=os.getenv('RDS_PASSWORD'),
            port=5432,
            connect_timeout=5
        )
        return conn
    except Exception as e:
        print(f"RDS Connection Error: {e}")
        return None

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serves static files (tsx, css, etc.) to resolve 404 errors."""
    return send_from_directory('.', path)

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to connect to RDS"}), 500
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute('SELECT * FROM inventory ORDER BY name ASC;')
        items = cur.fetchall()
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/inventory', methods=['POST'])
def add_item():
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to connect to RDS"}), 500
    
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO inventory (name, category, current_quantity, min_required_quantity, price, sales_history) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;',
            (data['name'], data['category'], data['current_quantity'], data['min_required_quantity'], data['price'], json.dumps(data.get('sales_history', [])))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({"id": new_id, "status": "success"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/health')
def health():
    """CloudWatch Health Check endpoint."""
    conn = get_db_connection()
    db_status = "connected" if conn else "disconnected"
    if conn: conn.close()
    return jsonify({
        "status": "healthy",
        "region": os.getenv('AWS_REGION', 'us-east-1'),
        "rds": db_status,
        "model": os.getenv('BEDROCK_MODEL_ID', 'amazon.nova-lite-v1:0')
    })

if __name__ == '__main__':
    # EC2 Standard Port
    app.run(host='0.0.0.0', port=8080, debug=False)
