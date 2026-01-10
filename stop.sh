#!/bin/sh
docker compose down
for port in 9000 8000; do
  pid=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING | awk '{print $5}' | head -1)
  if [ -n "$pid" ] && [ "$pid" != "0" ]; then
    taskkill //PID $pid //F 2>/dev/null || kill -9 $pid 2>/dev/null || true
  fi
done

