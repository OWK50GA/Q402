# Docker Deployment Guide

Complete guide for deploying x402 BNB using Docker.

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your configuration
nano .env

# 3. Build and start services
docker-compose up -d

# 4. Check logs
docker-compose logs -f facilitator
```

## Environment Variables

Create a `.env` file in the project root with:

```env
# Required
SPONSOR_PRIVATE_KEY=0x...
RPC_URL_BSC_TESTNET=https://data-seed-prebsc-1-s1.binance.org:8545

# Optional
NODE_ENV=production
LOG_LEVEL=info
IMPLEMENTATION_WHITELIST=0x...
MAX_GAS_PRICE_GWEI=10
```

## Services

### Facilitator (Core Service)

**Port**: 8080  
**Endpoints**:
- `POST /verify` - Verify payment
- `POST /settle` - Settle payment
- `GET /supported` - List supported networks
- `GET /health` - Health check

```bash
# Start facilitator only
docker-compose up -d facilitator

# View logs
docker-compose logs -f facilitator

# Restart
docker-compose restart facilitator
```

### Example Server (Demo)

**Port**: 3000  
**Routes**:
- `GET /` - Server info
- `GET /api/premium-data` - Protected endpoint (requires payment)

```bash
# Start example server
docker-compose up -d example-server
```

### Optional Services

**Redis** (Port 6379) - Caching and nonce tracking  
**PostgreSQL** (Port 5432) - Payment history  
**Prometheus** (Port 9090) - Metrics  
**Grafana** (Port 3001) - Dashboards

## Development Mode

Use the development compose file:

```bash
# Start development services
docker-compose -f docker-compose.dev.yml up

# Features:
# - Hot reload
# - Debug logging
# - Volume mounts for live code changes
```

## Production Deployment

### 1. Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build facilitator
```

### 2. Configure Environment

```bash
# Production environment
export NODE_ENV=production
export LOG_LEVEL=info

# Security
export SPONSOR_PRIVATE_KEY=$(vault read -field=key secret/x402/sponsor)
export IMPLEMENTATION_WHITELIST=0xContract1,0xContract2

# Network
export RPC_URL_BSC_MAINNET=https://your-rpc-endpoint
export MAX_GAS_PRICE_GWEI=5
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Health Checks

```bash
# Check facilitator health
curl http://localhost:8080/health

# Check supported networks
curl http://localhost:8080/supported

# Check example server
curl http://localhost:3000
```

## Monitoring

### Prometheus Metrics

Access at: http://localhost:9090

Key metrics:
- `x402_payments_verified_total` - Total verifications
- `x402_payments_settled_total` - Total settlements
- `x402_payment_amount` - Payment amounts
- `x402_gas_used` - Gas consumption

### Grafana Dashboards

Access at: http://localhost:3001  
Default credentials: `admin / admin` (change immediately)

Pre-configured dashboards:
- Payment Overview
- Settlement Analytics
- Gas Usage
- Error Rates

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  facilitator:
    deploy:
      replicas: 3
    environment:
      - REDIS_URL=redis://redis:6379
```

```bash
# Scale facilitator
docker-compose up -d --scale facilitator=3

# Behind load balancer
# Use nginx or traefik
```

### Load Balancer

```bash
# Install nginx
docker-compose -f docker-compose.yml -f docker-compose.nginx.yml up -d
```

## Backup and Recovery

### Database Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U x402bnb x402bnb > backup.sql

# Restore
docker-compose exec -T postgres psql -U x402bnb x402bnb < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm \
  -v x402-bnb_facilitator-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/facilitator-data-backup.tar.gz -C /data .

# Restore
docker run --rm \
  -v x402-bnb_facilitator-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/facilitator-data-backup.tar.gz -C /data
```

## Security

### 1. Secure Private Keys

```bash
# Use Docker secrets (Swarm mode)
echo "0x..." | docker secret create sponsor_key -

# Or use environment from vault
export SPONSOR_PRIVATE_KEY=$(vault read -field=key secret/x402/sponsor)
```

### 2. Network Security

```yaml
# docker-compose.yml
services:
  facilitator:
    networks:
      - internal
    expose:
      - "8080"
  
  nginx:
    networks:
      - internal
      - external
    ports:
      - "443:443"
```

### 3. Resource Limits

```yaml
services:
  facilitator:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs facilitator

# Common issues:
# - Missing SPONSOR_PRIVATE_KEY
# - Invalid RPC URL
# - Port already in use
```

### Out of Gas

```bash
# Check sponsor balance
# Fund sponsor account with BNB

# Check gas price settings
docker-compose exec facilitator env | grep GAS
```

### RPC Connection Issues

```bash
# Test RPC connectivity
docker-compose exec facilitator node -e "
  const http = require('http');
  http.get(process.env.RPC_URL_BSC_TESTNET, (res) => {
    console.log('RPC Status:', res.statusCode);
  });
"

# Try alternative RPC
export RPC_URL_BSC_TESTNET=https://bsc-testnet.publicnode.com
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Increase memory limit
docker-compose up -d --scale facilitator=1 --memory=2g
```

## Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart facilitator

# View logs
docker-compose logs -f facilitator

# Execute command in container
docker-compose exec facilitator sh

# Check service status
docker-compose ps

# Remove volumes (CAUTION: deletes data)
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Update images
docker-compose pull
docker-compose up -d
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build
        run: docker-compose build
      
      - name: Push to Registry
        run: |
          docker tag x402-bnb-facilitator registry.example.com/x402-bnb:${{ github.sha }}
          docker push registry.example.com/x402-bnb:${{ github.sha }}
      
      - name: Deploy
        run: |
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

## Performance Tuning

```yaml
# docker-compose.performance.yml
services:
  facilitator:
    environment:
      - NODE_OPTIONS=--max-old-space-size=4096
      - UV_THREADPOOL_SIZE=128
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
```

## Support

- Issues: https://github.com/quack-ai/x402-bnb/issues
- Docs: https://github.com/quack-ai/x402-bnb
- Docker Hub: (coming soon)

---

**Last Updated**: 2025-01-31


