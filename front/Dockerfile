FROM node:22.18.0-alpine

WORKDIR /app

# Copier les fichiers package d'abord
COPY package*.json ./

# Installer toutes les dépendances (dont devDependencies)
RUN npm install

# Copier le code source
COPY . .
COPY vite.config.js ./

# Exposer le port que Vite utilise
EXPOSE 5173

# Lancer en mode développement 
CMD ["npm", "run", "dev", "--", "--host=0.0.0.0"]