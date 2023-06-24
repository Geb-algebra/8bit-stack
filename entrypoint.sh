#!/bin/sh -e

echo $HOST

npx prisma migrate deploy
npm run start