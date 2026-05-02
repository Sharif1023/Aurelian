# Sharuu.com Deployment Setup Guide

This guide provides step-by-step instructions to deploy your Sharuu e-commerce application to **test.sharuu.com**.

## 📋 Prerequisites

- Node.js 18+ installed on server
- MySQL database access
- Domain control (test.sharuu.com)
- Web server (Apache/Nginx) or hosting with Node.js support
- SSL certificate for HTTPS

## 🗂️ Project Structure Overview

```
sharuu.com/
├── backend/
│   └── server.js              # Express.js backend server
├── src/
│   ├── components/             # React components
│   ├── screens/               # React screens/pages
│   ├── context/               # React context providers
│   └── lib/                  # Utility functions
├── public/                   # Static assets
├── dist/                     # Build output (generated)
├── package.json              # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── database_schema.sql       # Database schema
└── .env                    # Environment variables
```

## 🔧 Configuration Changes Required

### 1. Environment Variables

Create/update `.env` file with production values:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=sharuuco_test
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=https://test.sharuu.com,https://www.test.sharuu.com

# File Upload Limits
JSON_LIMIT=100mb

# Gemini AI API (if using AI features)
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Frontend Configuration

Update `vite.config.ts` for production:

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Remove server config for production build
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
    },
  };
});
```

### 3. Backend Configuration Updates

In `backend/server.js`, update these sections:

#### CORS Origins (Line 28-32):
```javascript
const allowedOrigins = (process.env.CORS_ORIGINS ||
  "https://test.sharuu.com,https://www.test.sharuu.com")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
```

#### Database Connection (Lines 18-22):
```javascript
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "sharuuco_test";
const DB_PORT = Number(process.env.DB_PORT || 3306);
```

## 🚀 Deployment Steps

### Step 1: Server Setup

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js** (if not installed)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2** (Process Manager)
   ```bash
   sudo npm install -g pm2
   ```

### Step 2: Database Setup

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE sharuuco_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Import Database Schema**
   ```bash
   mysql -u your_user -p sharuuco_test < database_schema.sql
   ```

3. **Verify Tables**
   ```sql
   USE sharuuco_test;
   SHOW TABLES;
   ```

### Step 3: Upload Files

1. **Clone/Upload Project**
   ```bash
   cd /var/www/
   git clone your-repo-url test.sharuu.com
   cd test.sharuu.com
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Build Frontend**
   ```bash
   npm run build
   ```

### Step 4: Configure Web Server

#### Option A: Apache Configuration

Create `/etc/apache2/sites-available/test.sharuu.com.conf`:

```apache
<VirtualHost *:80>
    ServerName test.sharuu.com
    ServerAlias www.test.sharuu.com
    
    # Redirect to HTTPS
    Redirect permanent / https://test.sharuu.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName test.sharuu.com
    ServerAlias www.test.sharuu.com
    DocumentRoot /var/www/test.sharuu.com/dist
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    # Proxy API requests to Node.js backend
    ProxyPreserveHost On
    ProxyRequests Off
    
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
    
    # Serve static files directly
    <Directory /var/www/test.sharuu.com/dist>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Handle React Router
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</VirtualHost>
```

#### Option B: Nginx Configuration

Create `/etc/nginx/sites-available/test.sharuu.com`:

```nginx
server {
    listen 80;
    server_name test.sharuu.com www.test.sharuu.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name test.sharuu.com www.test.sharuu.com;
    root /var/www/test.sharuu.com/dist;
    index index.html;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 5: Start Backend Service

1. **Create PM2 Configuration File** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'sharuu-backend',
    script: './backend/server.js',
    cwd: '/var/www/test.sharuu.com',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

2. **Start Application with PM2**
   ```bash
   # Create logs directory
   mkdir -p logs
   
   # Start the application
   pm2 start ecosystem.config.js
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 startup script
   pm2 startup
   ```

3. **Monitor Application**
   ```bash
   pm2 status
   pm2 logs sharuu-backend
   ```

### Step 6: SSL Certificate Setup

#### Option A: Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Obtain SSL certificate
sudo certbot --apache -d test.sharuu.com -d www.test.sharuu.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option B: Commercial SSL
1. Purchase SSL certificate for test.sharuu.com
2. Upload certificate files to server
3. Update web server configuration paths

### Step 7: Domain DNS Configuration

Update DNS records for test.sharuu.com:

```
Type    Name            Value
A       @               YOUR_SERVER_IP
A       www             YOUR_SERVER_IP
CNAME   api             @
```

## 🔍 Testing & Verification

### 1. Backend API Test
```bash
curl -X GET https://test.sharuu.com/api/products
```

### 2. Frontend Test
Visit `https://test.sharuu.com` in browser

### 3. Admin Panel Test
Visit `https://test.sharuu.com/admin` and login

### 4. Database Connection Test
```bash
mysql -u your_user -p -e "USE sharuuco_test; SELECT COUNT(*) FROM products;"
```

## 📝 Important Notes

### Security Considerations
1. **Change default passwords** in database and admin panel
2. **Use strong JWT secret** in environment variables
3. **Enable HTTPS** with valid SSL certificate
4. **Regular backups** of database and files
5. **Update dependencies** regularly

### Performance Optimization
1. **Enable gzip compression** in web server
2. **Configure caching headers** for static assets
3. **Use CDN** for static assets if possible
4. **Monitor server resources** and scale as needed

### Monitoring
1. **Set up application monitoring** (PM2 monitoring)
2. **Configure error logging** and alerting
3. **Monitor database performance**
4. **Track uptime** with monitoring service

## 🔄 Maintenance Commands

### Update Application
```bash
cd /var/www/test.sharuu.com
git pull origin main
npm install --production
npm run build
pm2 restart sharuu-backend
```

### Database Backup
```bash
mysqldump -u your_user -p sharuuco_test > backup_$(date +%Y%m%d).sql
```

### View Logs
```bash
pm2 logs sharuu-backend --lines 100
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGINS in .env
   - Verify web server proxy configuration

2. **Database Connection**
   - Verify database credentials
   - Check MySQL service status
   - Test connection manually

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

4. **404 Errors**
   - Verify web server configuration
   - Check React Router setup
   - Ensure build files exist

### Debug Commands
```bash
# Check Node.js version
node --version

# Check PM2 status
pm2 status

# Check Apache/Nginx status
sudo systemctl status apache2
# or
sudo systemctl status nginx

# Test database connection
mysql -u your_user -p -h localhost sharuuco_test

# Check ports
netstat -tulpn | grep :5000
```

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review application logs
3. Verify environment configuration
4. Test each component individually

---

**🎉 Your Sharuu e-commerce application should now be live at https://test.sharuu.com!**
