Copilot instructions

Purpose
- Explain repo layout, how to build/run, and important implementation details for reviewers and maintainers.

Quick start
- Install: npm ci
- Build: npm run build
- Dev: npm run start:dev
- Run (prod): npm run build && node dist/main.js

Repository overview
- Framework: NestJS + TypeORM
- DB: Postgres (env vars: PG_HOST, PG_PORT, PG_USERNAME, PG_PASSWORD, PG_DATABASE)
- Key entities: Session (src/session/session.entity.ts) and Event (src/event/event.entity.ts)
- Main module: src/app.module.ts (TypeOrmModule.forFeature([Session, Event]))

APIs
- POST /api/session -> create session (src/api/api.controller.ts)
- POST /api/event -> record event (delegates to EventService)
- POST /api/request-stats -> query sessions/events

Frontend
- Sirup (src/assets/sirup.ts) is the client helper that calls /api/session and /api/event. It stores session id in localStorage and sends events via fetch.

Buffering change
- Location: src/event/event.service.ts
- Behavior: in-memory buffer that batches events and flushes to DB when either:
  - buffer reaches 100 events (bufferLimit), or
  - oldest buffered event is >= 1 minute (maxBufferAgeMs)
- Flushes are attempted periodically (flushIntervalMs) and on shutdown (onModuleDestroy).
- Implementation notes:
  - Buffer is per-process memory. In multi-instance deployments events may be lost on instance crash before flush.
  - On DB failure the service logs the error and re-queues the batch to avoid data loss.

Configuration & tuning
- Change bufferLimit, maxBufferAgeMs, flushIntervalMs directly in EventService to tune behavior.
- For multi-instance durability replace in-memory buffer with a Redis-backed queue or message broker.

Testing & linting
- Tests: npm test
- Lint: npm run lint

Deployment
- Ansible playbook and configurator references are in README.md for environment generation.

Files of interest
- src/event/event.service.ts  (buffer logic)
- src/event/event.entity.ts   (event schema)
- src/session/session.entity.ts (session schema)
- src/api/*                    (controllers/services for API)
- src/assets/sirup.ts          (frontend client example)

Notes for reviewers
- Verify onModuleDestroy flushes events during graceful shutdown.
- Consider adding Prometheus metrics: current buffer size, flush duration, failed flush count.
- Consider exposing a health endpoint that verifies buffer persistence or queue connectivity when switching to external queue.

Contact
- Ask the maintainer before altering buffering semantics or DB schema.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
