FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production
ADD https://github.com/tesseract-ocr/tessdata/raw/refs/heads/main/chi_sim.traineddata .
COPY . .
RUN npm install
CMD ["index.js"]
