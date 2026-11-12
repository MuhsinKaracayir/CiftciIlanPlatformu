FROM node:20-alpine

WORKDIR /app

# Paket dosyalarini kopyala ve bagimliliklari yukle
COPY package*.json ./
RUN npm install --omit=dev

# Kaynak kodlari kopyala
COPY . .

# Yuklemeler klasorunu olustur
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "src/server.js"]

