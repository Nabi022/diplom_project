FROM node:20

WORKDIR /app

# только манифесты
COPY package*.json ./

# ставим зависимости и ДОСТАВЛЯЕМ бинарь rollup для linux
RUN npm install --omit=optional \
    && npm install -D @rollup/rollup-linux-x64-gnu

# копируем остальной код
COPY . .

# билд
RUN npm run build

# предпросмотр
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
