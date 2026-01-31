import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables from .env
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default-dev-key')

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('RDS_ENDPOINT'),
            database=os.getenv('RDS_DB_NAME'),
            user=os.getenv('RDS_USERNAME'),
            password=os.getenv('RDS_PASSWORD'),
            port=5432
        )
        return conn
    except Exception as e:
        print(f"Error connecting to RDS: {e}")
        return None

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM inventory ORDER BY name ASC;')
    items = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(items)

@app.route('/api/inventory', methods=['POST'])
def add_item():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO inventory (name, category, current_quantity, min_required_quantity, price, sales_history) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;',
        (data['name'], data['category'], data['current_quantity'], data['min_required_quantity'], data['price'], json.dumps(data.get('sales_history', [])))
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"id": new_id, "status": "success"}), 201

@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "region": os.getenv('AWS_REGION'),
        "model": os.getenv('BEDROCK_MODEL_ID')
    })

if __name__ == '__main__':
    # Ensure port 8080 is used as requested for EC2
    app.run(host='0.0.0.0', port=8080, debug=False)
