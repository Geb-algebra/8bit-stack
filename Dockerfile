FROM node:18-alpine
COPY . /code
WORKDIR /code
RUN npm install
# RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev
COPY entrypoint.sh /code/entrypoint.sh
RUN chmod +x /code/entrypoint.sh
ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 3000
ENTRYPOINT [ "sh", "/code/entrypoint.sh" ]
