# Deployment Guide

This guide covers deploying the AI-Driven Support Platform to production.

## Deployment Options

1. **Docker Compose** (Recommended for VMs/On-Premise)
2. **Kubernetes** (Recommended for Cloud/Scale)
3. **Traditional Deployment** (Manual setup)

## Docker Compose Deployment

### Prerequisites
- Linux server with Docker and Docker Compose
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- OpenAI API key

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-driven-support-platform
```

2. **Configure environment**
```bash
cd apps/backend
cp .env.example .env
# Edit .env with production values
```

Production .env example:
```env
DATABASE_URL="postgresql://postgres:STRONG_PASSWORD@postgres:5432/ai_support_platform?schema=public"
JWT_SECRET="GENERATE_A_STRONG_RANDOM_SECRET_HERE"
JWT_EXPIRATION="7d"
REDIS_HOST="redis"
REDIS_PORT=6379
OPENAI_API_KEY="sk-your-production-openai-key"
OPENAI_MODEL="gpt-4"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"
```

3. **Build production images**
```bash
# Backend
cd apps/backend
docker build -t ai-support-backend:prod .

# Frontend
cd apps/frontend
docker build -t ai-support-frontend:prod .
```

4. **Create production docker-compose**
```yaml
# infrastructure/docker/docker-compose.prod.yml
services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ai_support_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - app-network

  backend:
    image: ai-support-backend:prod
    restart: always
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ai_support_platform
      JWT_SECRET: ${JWT_SECRET}
      REDIS_HOST: redis
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    ports:
      - "3001:3001"

  frontend:
    image: ai-support-frontend:prod
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
      NEXT_PUBLIC_WS_URL: ${WS_URL}
    depends_on:
      - backend
    networks:
      - app-network
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

5. **Run migrations**
```bash
docker exec -it ai-support-backend npx prisma migrate deploy
```

6. **Set up Nginx reverse proxy (recommended)**
```nginx
# /etc/nginx/sites-available/ai-support
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or self-hosted)
- kubectl configured
- Helm (optional but recommended)

### Deployment Files

Create Kubernetes manifests:

**1. Namespace**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ai-support
```

**2. ConfigMap**
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ai-support-config
  namespace: ai-support
data:
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  NODE_ENV: "production"
```

**3. Secrets**
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ai-support-secrets
  namespace: ai-support
type: Opaque
stringData:
  POSTGRES_PASSWORD: "your-strong-password"
  JWT_SECRET: "your-jwt-secret"
  OPENAI_API_KEY: "sk-your-openai-key"
  DATABASE_URL: "postgresql://postgres:password@postgres-service:5432/ai_support_platform"
```

**4. PostgreSQL Deployment**
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: ai-support
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ai-support-secrets
              key: POSTGRES_PASSWORD
        - name: POSTGRES_DB
          value: ai_support_platform
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: ai-support
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

**5. Backend Deployment**
```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: ai-support
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ai-support-backend:prod
        envFrom:
        - configMapRef:
            name: ai-support-config
        - secretRef:
            name: ai-support-secrets
        ports:
        - containerPort: 3001
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: ai-support
spec:
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
```

**6. Frontend Deployment**
```yaml
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: ai-support
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ai-support-frontend:prod
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.yourdomain.com"
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: ai-support
spec:
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
```

**7. Ingress**
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-support-ingress
  namespace: ai-support
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - yourdomain.com
    - api.yourdomain.com
    secretName: ai-support-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3001
```

### Deploy to Kubernetes
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

## Security Checklist

- [ ] Use strong, unique passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS only for allowed origins
- [ ] Rotate JWT secrets regularly
- [ ] Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- [ ] Enable database encryption at rest
- [ ] Set up regular backups
- [ ] Implement monitoring and alerting
- [ ] Configure log aggregation
- [ ] Enable 2FA for admin accounts

## Monitoring

### Recommended Tools
- **Application Monitoring**: New Relic, DataDog, or Application Insights
- **Infrastructure**: Prometheus + Grafana
- **Logging**: ELK Stack or CloudWatch
- **Uptime Monitoring**: Pingdom, UptimeRobot

### Health Checks
```typescript
// Add to backend
@Get('/health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

## Backup Strategy

### Database Backups
```bash
# Daily automated backup
0 2 * * * docker exec ai-support-postgres pg_dump -U postgres ai_support_platform > /backups/db-$(date +\%Y\%m\%d).sql
```

### Retention Policy
- Daily backups: Keep for 7 days
- Weekly backups: Keep for 4 weeks
- Monthly backups: Keep for 12 months

## Scaling Considerations

### Horizontal Scaling
- Use load balancer for multiple backend/frontend instances
- Scale based on CPU/memory metrics
- Configure session affinity for WebSocket connections

### Database Scaling
- Use read replicas for read-heavy workloads
- Implement connection pooling
- Consider managed database services (RDS, Cloud SQL)

### Caching
- Use Redis for session storage
- Implement response caching where appropriate
- Use CDN for static assets

## Troubleshooting Production Issues

### Container Logs
```bash
# Docker
docker logs ai-support-backend
docker logs ai-support-frontend

# Kubernetes
kubectl logs -f deployment/backend -n ai-support
kubectl logs -f deployment/frontend -n ai-support
```

### Database Connection Issues
```bash
# Check database connectivity
docker exec -it ai-support-backend npx prisma db pull
```

### Common Issues
1. **502 Bad Gateway**: Backend not responding, check backend logs
2. **Database connection refused**: Check DATABASE_URL and network
3. **WebSocket connection failed**: Check CORS and proxy configuration
4. **High memory usage**: Increase container limits or optimize queries

## Performance Optimization

1. **Enable caching**
2. **Optimize database queries** (add indexes)
3. **Use CDN for static assets**
4. **Enable gzip compression**
5. **Implement lazy loading**
6. **Use connection pooling**
7. **Optimize Docker images** (multi-stage builds)

## Cost Optimization

1. **Use spot instances** for non-critical workloads
2. **Right-size your resources**
3. **Implement auto-scaling**
4. **Use reserved instances** for predictable workloads
5. **Optimize API calls** to OpenAI
6. **Implement caching** to reduce database load
7. **Monitor and eliminate waste**

## Support

For deployment assistance, create an issue on GitHub or consult the documentation.
