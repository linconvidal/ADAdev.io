# ADAdev.io

A modern web application showcasing Cardano development resources with AI-powered recommendations.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ADAdev.io.git
   cd ADAdev.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **For production**
   ```bash
   npm run build
   npm start
   ```

## 🔒 Security Considerations

### Before Making Public

1. **Environment Variables**
   - Ensure `.env` file is in `.gitignore` ✅
   - Never commit API keys or tokens
   - Use environment-specific configurations

2. **API Keys & Tokens**
   - OpenAI API key is server-side only ✅
   - GitHub token is optional but recommended for higher rate limits
   - All sensitive data is properly handled

3. **Input Validation**
   - AI endpoint validates and sanitizes input ✅
   - Rate limiting implemented ✅
   - XSS protection enabled ✅

4. **CORS Configuration**
   - Configured for specific origins ✅
   - Update `CORS_ORIGINS` in production

5. **Security Headers**
   - CSP, XSS Protection, Frame Options ✅
   - HTTPS enforcement ready ✅

### Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS with SSL certificates
- [ ] Update nginx configuration for your domain
- [ ] Monitor logs for suspicious activity
- [ ] Regular security updates

## 📁 Project Structure

```
ADAdev.io/
├── src/
│   ├── components/     # React components
│   ├── services/       # API services
│   ├── data/          # Static data
│   └── utils/         # Utilities
├── server.js          # Express server
├── nginx.conf         # Nginx configuration
└── Dockerfile         # Docker configuration
```

## 🛠️ Development

- **Frontend**: React + Vite
- **Backend**: Express.js
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For security issues, please email security@adadev.io 