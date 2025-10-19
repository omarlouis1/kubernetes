# Dockerfile
FROM nginx:alpine

# Supprime la config Nginx par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copie le build React dans le dossier Nginx
COPY build/ /usr/share/nginx/html

# Expose le port 80
EXPOSE 80

# Démarre Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]
