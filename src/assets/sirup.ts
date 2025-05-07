/**
 * Sirup is the frontend toolkit to track products usages with solid pancake.
 */
class Sirup {

  protected config: ISirupConfig;
  protected sessionId: string|null = null;

  /**
   * Bootstrap Sirup. Make it accessible to window.sirup property globally.
   * @param config
   */
  bootstrap(config: ISirupConfig) {
    // Store config
    this.config = config;

    // Store in Window
    const windowRef = window || {sirup: null};
    // tslint:disable-next-line: no-string-literal
    windowRef['sirup'] = this;
  }

  /**
   * Grab a previous session token, or create a new one
   * @param product
   * @param label
   * @param version
   */
  async persistantSession(product, label = '', version = '') {
    // Get the local storage key
    const sessionStorageKey = `sirup-session-${product}-${label}-${version}`;

    // Get persisted session ID
    const sessionIdPersistant: string|undefined = sessionStorage.getItem(sessionStorageKey);
    if (sessionIdPersistant != undefined) {
      const sessionIdPersistantObject = JSON.parse(sessionIdPersistant);
      if (sessionIdPersistantObject) {
        this.sessionId = sessionIdPersistantObject.sessionId;
        return;
      }
    }

    // Create a session
    await this.session(product, label, version);

    // Persist session
    sessionStorage.setItem(sessionStorageKey, JSON.stringify({sessionId: this.sessionId}));
  }

  /**
   * Create a session
   * @param product
   * @param label
   * @param version
   */
  async session(product, label = '', version = '') {
    this.sessionId = await this.call('session', {
      product,
      label,
      version,
    });
  }

  /**
   * Track an event in SolidPancake
   * @param sessionId
   * @param event
   * @param category
   * @param action
   * @param label
   */
  event(event, category, action = '', label = '') {
    this.call('event', {
      sessionId: this.sessionId,
      event,
      category,
      action,
      label,
    });
  }

  /**
   * Call the SolidPancake API
   * @param endpoint
   * @param data
   */
  protected async call(endpoint, data) {
    const response: Response = await fetch(
      `${this.config.baseUrl}/api/${endpoint}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
      },
    );
    return await response.text();
  }

}

/**
 * Represents a sirup config
 */
interface ISirupConfig {
  baseUrl: string;
}

// Conts template
const baseUrl = `{baseUrl}`;

// Create the Sirup object
const s = new Sirup();
s.bootstrap({
  baseUrl,
});
