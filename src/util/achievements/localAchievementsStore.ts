import { AchievementsProvider } from "./achievementsProvider";
import { Achievement } from "./";
import { AchievementOptions } from "./achievementOptions";

export class LocalAchievementsStore implements AchievementsProvider {
  /**
   * The loaded achievements
   */
  private achievements: Achievement[];

  /**
   * Creates a local Achievement store that stores hard-coded achievements in memory
   */
  constructor(achievementsToLoad: AchievementOptions[]) {
    this.achievements = [];

    let id = 0;
    achievementsToLoad.forEach((options: AchievementOptions) => {
      this.achievements.push(new Achievement(id, options));
      id++;
    });
  }

  /**
   * Returns all achievements
   */
  public async getAchievements(): Promise<Achievement[]> {
    return this.achievements;
  }

  /**
   * Returns an achievement with the given id. Returns undefined if not found
   * @param id The id of the achievement to search for
   */
  public async getAchievementWithId(id: number): Promise<Achievement> {
    return this.achievements.find((achievement: Achievement) => achievement.getId() === id);
  }
}