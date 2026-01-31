
# InvTrack Pro - AI Inventory Tracker (Deployment Guide)

A high-performance inventory management system ready for Amazon EC2 and RDS.

## 🛠️ ENVIRONMENT CONFIGURATION (.env)
Create a `.env` file in the root with your values:
```env
GEMINI_API_KEY=your_key
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
RDS_ENDPOINT=your-rds-endpoint.rds.amazonaws.com
RDS_DB_NAME=invtrackdb
RDS_USERNAME=dbuser
RDS_PASSWORD=dbpassword
FLASK_SECRET_KEY=generate-a-secure-random-string
```

## 🚀 DEPLOYMENT STEPS (EC2)
1. **Prepare EC2**: Launch Amazon Linux 2 and install Python 3.9+.
2. **Setup DB**: Run all queries in `queries.txt` against your RDS instance.
3. **Install**: `pip install -r requirements.txt`
4. **Launch**: `python3 app.py`
5. **Verify**: Navigate to `http://<ec2-public-ip>:8080`.

## ✅ COMPONENT STATUS
- **Frontend**: Serves as ES6 modules via Flask proxy.
- **Backend**: Python Flask bridge for RDS security.
- **AI**: Nova Lite emulation via Gemini Flash (High Speed).
- **RDS**: PostgreSQL persistence layer.
