# InvTrack Pro - AI Inventory Tracker (AWS Edition)

InvTrack Pro is a professional inventory management system designed for the AWS ecosystem, featuring real-time RDS synchronization and Bedrock-grade AI insights using Amazon Nova Lite.

## 🚀 DEPLOYMENT INSTRUCTIONS (EC2)

### Option A: Simple EC2 Deployment
1.  **Launch Instance**: Launch an Amazon Linux 2 or Ubuntu 22.04 EC2 instance. Ensure port `8080` is open in the Security Group.
2.  **Environment Setup**:
    ```bash
    sudo yum update -y
    sudo yum install python3 python3-pip git -y
    ```
3.  **Clone & Install**:
    ```bash
    git clone <your-repo-url>
    cd invtrack-pro
    pip install -r requirements.txt
    ```
4.  **Configuration**: 
    - Create a `.env` file in the root directory (see Environment Variables section below).
    - Run the SQL queries found in `queries.txt` against your RDS instance using a tool like `psql` or the Query Editor.
5.  **Execution**:
    ```bash
    # Create start script
    echo "python3 app.py" > start.sh
    chmod +x start.sh
    ./start.sh
    ```

### Option B: Docker on EC2
1.  **Install Docker**: `sudo amazon-linux-extras install docker -y && sudo service docker start`
2.  **Build**: `docker build -t invtrack-pro .`
3.  **Run**:
    ```bash
    docker run -d \
      -p 8080:8080 \
      --env-file .env \
      --name inventory-app \
      invtrack-pro
    ```

## ⚙️ ENVIRONMENT VARIABLES (.env)
Create a `.env` file with the following keys:
```env
GEMINI_API_KEY=YOUR_API_KEY
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
RDS_ENDPOINT=your-rds-endpoint.rds.amazonaws.com
RDS_DB_NAME=invtrackdb
RDS_USERNAME=dbuser
RDS_PASSWORD=dbpassword
FLASK_SECRET_KEY=your-random-secret-key
```

## ✅ VALIDATION CRITERIA
- **Connectivity**: Application starts on port `8080` and reaches the login screen.
- **RBAC**: Admin users can create/edit/delete; Employees have read-only views.
- **AI Intelligence**: Bedrock Nova Lite provides JSON-based restock predictions.
- **RDS Persistence**: Inventory changes persist across sessions in PostgreSQL.
