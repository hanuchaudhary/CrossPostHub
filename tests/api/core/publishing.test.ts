import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CrossPostHub,
  LinkedInProvider,
  TwitterProvider,
} from "../../../packages/post/src";
import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
} from "../../../packages/post/src";

const content: PublishContent = {
  account: { accountId: "person-1", accessToken: "test-token" },
  text: "Hello from CrossPostHub",
};

test("CrossPostHub dispatches to custom providers and rejects unknown or duplicate providers", async () => {
  let received: PublishContent | undefined;
  const custom: CrossPostProvider = {
    name: "custom",
    async publish(input) {
      received = input;
      return { provider: this.name, response: { id: "1" } };
    },
  };
  const hub = new CrossPostHub().registerProvider(custom);
  assert.deepEqual(hub.getProviders(), ["custom"]);
  assert.deepEqual(await hub.publish({ provider: "custom", ...content }), {
    provider: "custom",
    response: { id: "1" },
  });
  assert.deepEqual(received, content);
  assert.throws(() => hub.registerProvider(custom), /already registered/);
  await assert.rejects(
    hub.publish({ provider: "instagram", ...content }),
    /not enabled/,
  );
});
