FROM node:22.18.0-alpine

WORKDIR /app

# Copier les fichiers package d'abord
COPY package*.json ./

# Installer toutes les dépendances
RUN npm install

# Copier le code source
COPY . .
COPY vite.config.js ./

# Passer l'URL du backend au moment du build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Exposer le port que Vite utilise
EXPOSE 5173

# Lancer en mode dev
CMD ["npm", "run", "dev", "--", "--host=0.0.0.0"]
