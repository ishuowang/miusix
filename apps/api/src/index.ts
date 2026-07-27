import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { trackSchema, type Track } from "@miusix/contracts";
import { z } from "zod";
import { demoCatalog, demoTracks } from "./catalog.js";
import { closeDatabase, pool } from "./db.js";

const app = Fastify({ logger: true });
const port = Number(process.env.API_PORT ?? 4000);
const host = process.env.API_HOST ?? "0.0.0.0";
const mediaRoot = resolve(process.env.MEDIA_ROOT ?? "./storage/media");

await app.register(cors, {
  origin: process.env.WEB_ORIGIN?.split(",") ?? true,
  credentials: true
});

app.get("/health", async () => ({
  status: "ok",
  service: "miusix-api",
  version: "0.1.0"
}));

async function listTracks(): Promise<Track[]> {
  if (!pool) return demoTracks;
  try {
    const result = await pool.query(
      `select id, title, artist, album, duration_seconds, artwork, explicit
       from tracks order by created_at desc`
    );
    if (result.rowCount === 0) return demoTracks;
    return result.rows.map((row) =>
      trackSchema.parse({
        id: row.id,
        title: row.title,
        artist: row.artist,
        album: row.album,
        durationSeconds: row.duration_seconds,
        artwork: row.artwork,
        streamUrl: `/v1/tracks/${row.id}/stream`,
        explicit: row.explicit
      })
    );
  } catch (error) {
    app.log.warn({ error }, "database unavailable; serving demo catalog");
    return demoTracks;
  }
}

app.get("/v1/tracks", async () => listTracks());

app.get("/v1/catalog", async () => {
  const tracks = await listTracks();
  return {
    ...demoCatalog,
    featured: tracks,
    recentlyPlayed: [...tracks].reverse()
  };
});

app.get("/v1/tracks/:id", async (request, reply) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
  const track = (await listTracks()).find((item) => item.id === id);
  return track ?? reply.code(404).send({ message: "Track not found" });
});

app.get("/v1/tracks/:id/stream", async (request, reply) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
  const filePath = resolve(mediaRoot, `${id}.mp3`);
  if (!filePath.startsWith(`${mediaRoot}${sep}`) || !existsSync(filePath)) {
    return reply.code(404).send({
      message: "Audio is not uploaded yet",
      expectedPath: `storage/media/${id}.mp3`
    });
  }

  const size = statSync(filePath).size;
  const range = request.headers.range;
  reply.header("Accept-Ranges", "bytes").header("Content-Type", "audio/mpeg");

  if (!range) {
    reply.header("Content-Length", size);
    return reply.send(createReadStream(filePath));
  }

  const match = /^bytes=(\d+)-(\d*)$/.exec(range);
  if (!match) return reply.code(416).send();
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;
  if (start >= size || end >= size || start > end) return reply.code(416).send();

  reply
    .code(206)
    .header("Content-Range", `bytes ${start}-${end}/${size}`)
    .header("Content-Length", end - start + 1);
  return reply.send(createReadStream(filePath, { start, end }));
});

app.addHook("onClose", closeDatabase);

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
