# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base

WORKDIR /app  # Set working directory

COPY . .
RUN bun install
CMD ["bun", "index.ts"]


ENV NODE_ENV=production
RUN bun test
RUN bun run build

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "dev" ]
