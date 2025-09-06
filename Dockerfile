FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install watchman (opcional)
RUN apt-get update && apt-get install -y watchman

COPY . .

EXPOSE 19000 19001 19002 8081

CMD ["npx", "expo", "start", "--tunnel"]
