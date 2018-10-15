import { CacheObject } from "./cacheObject";

/**
 * Abstract class for a collection of objects in the cache
 * @param T The type of objects to store in the collection
 */
export abstract class CacheCollection<T extends CacheObject> extends CacheObject {
  /**
   * Array containing all elements in the collection
   */
  protected elements: Map<string, T>;

  /**
   * Creates a collection for cached objects
   */
  constructor() {
    super(0);
  }

  /**
   * Gets an element of the collection with the specified id
   * returns undefined if no object with given id is found
   * @param id The id of the requested element
   */
  public async getElement(id: string): Promise<T> {
    if (this.isExpired()) {
      await this.sync();
    }
    if (this.elements.has(id)) {
      if (this.elements[id].isExpired()) {
        await this.elements[id].sync();
      }
      return await this.elements[id].get();
    } else {
      return undefined;
    }
  }
}