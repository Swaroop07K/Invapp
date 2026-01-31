
import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Load from .env for EC2 deployment
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Use Flask Secret Key from .env
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default-fallback-key')

def get_db_connection():
    """Establishes connection to the AWS RDS Instance using .env credentials."""
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
        print(f"CRITICAL: RDS Connection Failed: {e}")
        return None

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/inventory', methods=['GET'])
def fetch_all_inventory():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "RDS_CONNECTION_FAILURE"}), 500
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM inventory ORDER BY name ASC;')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

@app.route('/api/inventory', methods=['POST'])
def add_inventory_record():
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "RDS_WRITE_FAILURE"}), 500
        
    cur = conn.cursor()
    cur.execute(
        '''INSERT INTO inventory 
           (name, category, current_quantity, min_required_quantity, price, sales_history) 
           VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;''',
        (
            data['name'], 
            data['category'], 
            data['current_quantity'], 
            data['min_required_quantity'], 
            data['price'], 
            json.dumps(data.get('sales_history', []))
        )
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"id": new_id, "status": "record_created"}), 201

@app.route('/api/health')
def system_health():
    """CloudWatch friendly health check endpoint."""
    return jsonify({
        "status": "active",
        "service": "InvTrackPro",
        "region": os.getenv('AWS_REGION', 'unknown'),
        "rds_link": "established" if get_db_connection() else "broken"
    })

if __name__ == '__main__':
    # Standard AWS port for internal microservices or public proxy
    app.run(host='0.0.0.0', port=8080, debug=False)
