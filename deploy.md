# ADAdev Deployment Guide

## Digital Ocean App Platform Deployment

### Prerequisites
1. Digital Ocean account
2. GitHub repository with your ADAdev code
3. OpenAI API key

### Deployment Steps

#### Option 1: Using Digital Ocean App Platform (Recommended)

1. **Prepare your repository**
   - Ensure your code is pushed to GitHub
   - Update `app.yaml` with your actual repository details
   - Replace `your-username/adadev` with your actual GitHub repo

2. **Deploy via Digital Ocean Console**
   - Go to Digital Ocean App Platform
   - Click "Create App"
   - Connect your GitHub repository
   - Digital Ocean will automatically detect the `app.yaml` configuration
   - Set environment variables:
     - `VITE_OPENAI_API_KEY`: Your OpenAI API key (as a secret)

3. **Configure Environment Variables**
   - In the Digital Ocean App Platform dashboard
   - Go to your app settings
   - Add the following environment variables:
     ```
     VITE_OPENAI_API_KEY=your_openai_api_key_here
     NODE_ENV=production
     PORT=3000
     ```

#### Option 2: Using Docker

1. **Build and push Docker image**
   ```bash
   # Build the image
   docker build -t adadev .
   
   # Tag for your registry
   docker tag adadev your-registry/adadev:latest
   
   # Push to registry
   docker push your-registry/adadev:latest
   ```

2. **Deploy to Digital Ocean Droplet**
   - Create a new Droplet
   - Install Docker on the Droplet
   - Run the container:
   ```bash
   docker run -d -p 80:80 \
     -e VITE_OPENAI_API_KEY=your_api_key \
     your-registry/adadev:latest
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `NODE_ENV` | Environment (production/development) | No (default: production) |
| `PORT` | Port for the application | No (default: 3000) |

### Custom Domain Setup

1. **Add custom domain in Digital Ocean**
   - Go to your app settings
   - Add your domain
   - Update DNS records as instructed

2. **SSL Certificate**
   - Digital Ocean App Platform provides automatic SSL
   - For custom domains, SSL is automatically provisioned

### Monitoring and Logs

- **Logs**: Available in Digital Ocean App Platform dashboard
- **Metrics**: Monitor CPU, memory, and request metrics
- **Health Checks**: Application includes `/health` endpoint

### Troubleshooting

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version compatibility (18+)

2. **Runtime Errors**
   - Check environment variables are set correctly
   - Verify OpenAI API key is valid
   - Review application logs in Digital Ocean dashboard

3. **Performance Issues**
   - Monitor resource usage in Digital Ocean dashboard
   - Consider upgrading instance size if needed
   - Enable caching headers (already configured in nginx.conf)

### Security Considerations

- OpenAI API key is stored as a secret in Digital Ocean
- HTTPS is automatically enabled
- Security headers are configured in nginx
- No sensitive data is exposed in client-side code

### Cost Optimization

- Start with `basic-xxs` instance size
- Monitor usage and scale up if needed
- Consider using Digital Ocean's free tier for testing 