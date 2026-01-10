#!/bin/sh
docker compose up -d
(cd backend && pnpm dev > ../logs/backend.log 2>&1) &
(cd storefront && pnpm dev > ../logs/storefront.log 2>&1) &

