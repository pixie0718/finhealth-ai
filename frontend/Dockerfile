# FinHealth AI — frontend (React CRA) built and served as static files via nginx
FROM node:20-alpine AS build

WORKDIR /app

# Build-time API URL (compiled into the bundle). Override in docker-compose.
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Serve stage ──
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
