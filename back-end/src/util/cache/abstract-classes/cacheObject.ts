/**
 * Abstract class for all objects stored in the cache
 */
export abstract class CacheObject {
  /**
   * The id of the object in the database
   */
  public id: number;

  /**
   * The amount of time the object stays synced (miliseconds).
   * The expiration duration is set to 10 seconds by default.
   * If this is set to a negative value, the object will never expire.
   */
  protected expiresIn: number = 10000;

  /**
   * The date when the object was last synced
   */
  public syncedAt: number;

  /**
   * Creates a new basic cache object
   * @param id The id of the object in the database
   */
  constructor(id: number) {
    this.id = id;
    this.syncedAt = Date.now();
  }

  /**
   * Checks if the object is expired and needs syncing
   */
  public isExpired(): boolean {
    if (this.expiresIn < 0) { // Object is set to never expire
      return false;
    }
    return this.syncedAt == undefined || // Object has not been initialized yet
      Date.now() > this.syncedAt + this.expiresIn; // Object is expired
  }
  /**
   * Syncs the object with the database
   */
  public abstract async sync(): Promise<void>;
}