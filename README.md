# Prerender with memory cache

This project is based on the following projects:

- https://github.com/prerender/prerender
- https://github.com/prerender/prerender-memory-cache

# Running

- `docker compose up`

# Using

- Compare:
  - without prerender: `curl https://feolavka.ru/`;
  - with prerender: `curl http://localhost:3000/render?url=https://feolavka.ru/`
  - on real site: `curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" --connect-timeout 60 https://feolavka.ru`