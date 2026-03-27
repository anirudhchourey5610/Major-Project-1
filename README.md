# Net Shield - Network Security Analyzer

A network security dashboard that captures packet events, classifies threats, and presents logs, alerts, reports, and user settings through a React interface backed by MongoDB and Express.

## 🎯 Features

### Real-Time Dashboard
- Live network traffic visualization
- Active alerts feed with color-coded severity levels
- Threat level monitoring
- Packet statistics and analytics

### Packet Analysis
- Python-based packet capture using Scapy
- Real-time threat detection:
  - Port scan detection
  - DoS attack monitoring
  - Suspicious port access alerts
- Automatic classification (normal/suspicious/malicious)

### Alert Management
- Color-coded severity levels (Low, Medium, High, Critical)
- Alert status tracking (Unresolved, Investigating, Resolved)
- Real-time notifications
- Detailed threat information

### Comprehensive Logging
- Searchable packet logs
- Protocol filtering
- Status-based filtering
- CSV export functionality
- Pagination support

### Security Reports
- One-click report generation
- Severity breakdown analysis
- Threat type statistics
- Downloadable reports
- Historical tracking

### Settings & Configuration
- Customizable alert thresholds
- Email notification preferences
- Role-based access control (Admin, Analyst, Viewer)
- User profile management

## 🌐 Deployment

This project is now set up to run as a single Vercel project:
- Live Project: https://major-project-1-yuv5.vercel.app
- the Vite frontend is served by Vercel
- the Express backend is exposed through `api/index.js`
- production frontend requests use the same domain, so `VITE_API_URL` is optional

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Packet Capture**: Python 3, Scapy
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel Functions + Vercel Static Hosting

## 📁 Project Structure

```
NetShield/
├── api/                # Vercel serverless entrypoint
├── capture/            # Python packet analyzer
├── server/             # Express app, database connection, Mongoose models
├── src/                # React frontend
├── .env.example
├── vercel.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.7+
- MongoDB Atlas account
- Administrator/Root access (for packet capture)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

#### 2. Install Node Dependencies
```bash
npm install
```

#### 3. Install Python Dependencies
```bash
cd capture
pip install -r requirements.txt
cd ..
```

#### 4. Environment Setup

Create a `.env` file in the project root from `.env.example`:

```bash
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/netshield
JWT_SECRET=your_secure_secret_key_here
FRONTEND_URL=http://localhost:5173,https://your-vercel-project.vercel.app
VITE_API_URL=
```

**⚠️ Never commit `.env` file to GitHub. Keep it local only.**

### Running the Application

#### 1. Start the backend API
```bash
npm run server
```

#### 2. Start the frontend development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

#### 3. Create a user account
- Sign up with email and password
- Your account will be created in MongoDB

#### 4. Run the packet analyzer
```bash
cd capture
export USER_ID='your-user-id-from-mongodb'
export API_URL='http://localhost:5000'
sudo -E python3 packet_analyzer.py
```

**Windows (PowerShell):**
```powershell
cd capture
$env:USER_ID='your-user-id'
$env:API_URL='http://localhost:5000'
python3 packet_analyzer.py
```

## 🚀 Vercel Deployment

### 1. Push the repo to GitHub

Commit the full project, including `api/index.js`, `server/`, `src/`, and `vercel.json`.

### 2. Import the repo into Vercel

1. Open [Vercel](https://vercel.com)
2. Click `Add New Project`
3. Import the GitHub repository
4. Keep the root directory as the repository root

### 3. Add Vercel environment variables

Set these variables in the Vercel project:

```bash
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/netshield
JWT_SECRET=your_secure_secret_key_here
FRONTEND_URL=https://your-vercel-project.vercel.app
```

`VITE_API_URL` is optional. Leave it empty to use same-origin API calls in production.

### 4. Deploy

After the first deploy:

- frontend pages are served from the main Vercel domain
- auth routes work at `/auth/*`
- data routes work at `/api/*`

### 5. Point the packet analyzer to production

If you want the Python analyzer to send data to the deployed app:

```bash
export API_URL='https://your-vercel-project.vercel.app'
```

## 🔒 Security Features

### Threat Detection

1. **Port Scanning**: Detects when a single IP attempts to connect to multiple ports
2. **DoS Attacks**: Identifies high-frequency packet floods
3. **Suspicious Access**: Monitors access to commonly exploited ports

### Authentication
- Email/password authentication
- Secure JWT token management
- Session management
- Role-based access control

### Data Protection
- MongoDB encryption at rest
- HTTPS recommended for production
- Password hashing with bcrypt
- User data isolation

## 📊 Database Schema

### Collections

- **users**: User accounts and profiles
- **packet_logs**: Captured network packet data
- **alerts**: Security alerts and threats
- **reports**: Generated security reports

### Indexes
- User ID indexes for fast queries
- Timestamp indexes for sorting
- Status indexes for filtering

## ⚙️ Configuration

### Alert Thresholds (Settings Page)

Configure in the application Settings:
- **Low Priority**: 1-50 alerts
- **Medium Priority**: 1-25 alerts
- **High Priority**: 1-10 alerts

### Python Analyzer Settings

Edit `capture/packet_analyzer.py`:

```python
DOS_THRESHOLD = 100          # Packets before DoS alert
PORT_SCAN_THRESHOLD = 20    # Ports before scan alert
SUSPICIOUS_PORTS = [22, 23, 445, 3389, 3306, 5432]
```

## 📝 Usage Guide

### First Time Setup

1. Sign up for an account
2. Get your User ID from MongoDB
3. Set `USER_ID` in the packet analyzer terminal
4. Configure alert thresholds in Settings
5. Start the packet analyzer
6. Monitor the dashboard

### Monitoring Network Activity

1. **Dashboard**: Real-time overview and recent alerts
2. **Logs**: Detailed packet information with filters
3. **Alerts**: Manage and respond to threats
4. **Reports**: Generate security summaries

### Responding to Threats

1. Review alert details
2. Mark as "Investigating" while analyzing
3. Take action (block IP, update firewall, etc.)
4. Mark as "Resolved" when complete

## 🔧 Troubleshooting

### Python Script Issues

```bash
# Permission denied
sudo -E python3 packet_analyzer.py

# No packets captured
# Check network interface: python3 -c "from scapy.all import get_if_list; print(get_if_list())"

# Database not updating
# Verify USER_ID is set: echo $USER_ID
```

### Frontend Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Port already in use
npm run dev -- --port 3000
```

### MongoDB Connection

- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure network access is enabled

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Python Analyzer as Service (Linux)

```bash
sudo nano /etc/systemd/system/netshield.service
```

Add:
```
[Unit]
Description=Net Shield Packet Analyzer
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/project/capture
Environment="USER_ID=your-user-id"
ExecStart=/usr/bin/python3 packet_analyzer.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable netshield
sudo systemctl start netshield
sudo systemctl status netshield
```

## 📈 Performance

- Handles 1000+ packets/second
- Real-time dashboard updates
- Efficient MongoDB queries with indexes
- Automatic data cleanup

## 🔐 Security Notes

- ⚠️ **This tool is for defensive security only**
- Only use on networks you own or have permission to monitor
- Packet capture requires root/administrator privileges
- Keep `.env` file secure and never share credentials
- Change default MongoDB password immediately
- Use HTTPS in production

## 🚧 Future Enhancements

- AI/ML-based threat detection
- Email alerts via SendGrid
- GeoIP location tracking
- Advanced protocol analysis
- Custom rule engine
- Mobile app support
- Multi-user collaboration
- Dark mode support

## 📄 License

This project is for educational and defensive security purposes.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add tests for new features
5. Update documentation
6. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Check capture/README.md for Python-specific help

---

**Built with ❤️ for network security monitoring and threat detection.**

Last Updated: December 11, 2025
