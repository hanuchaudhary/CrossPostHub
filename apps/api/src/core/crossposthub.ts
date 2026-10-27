import type { CrossPostProvider, PublishRequest, PublishResult } from "./types";

export class CrossPostHub {
  private readonly providers = new Map<string, CrossPostProvider>();

  constructor(providers: readonly CrossPostProvider[] = []) {
    for (const provider of providers) this.registerProvider(provider);
  }

  registerProvider(provider: CrossPostProvider): this {
    if (this.providers.has(provider.name)) {
      throw new Error(`Provider already registered: ${provider.name}`);
    }
    this.providers.set(provider.name, provider);
    return this;
  }

  getProviders(): string[] {
    return [...this.providers.keys()];
  }

  async publish({
    provider,
    ...content
  }: PublishRequest): Promise<PublishResult> {
    const implementation = this.providers.get(provider);
    if (!implementation) {
      throw new Error(`Publishing is not enabled for provider: ${provider}`);
    }
    return implementation.publish(content);
  }
}
