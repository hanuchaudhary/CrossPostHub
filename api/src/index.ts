import { Hono } from "hono";

type Environment = {
  readonly POSTHUB_QUEUE: Queue;
};

const app = new Hono<{ Bindings: Environment }>();

app.get("/message", async (c) => {
  return c.json({
    message: "hlo there",
  });
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<Error>, env: Environment) {
    console.log(batch.messages);
  },
};
