import { buildApp } from "../../../../src/app";
import { getConnection, createConnection } from "typeorm";
import { User, HardwareItem, ReservedHardwareItem } from "../../../../src/db/entity";
import { Express } from "express";
import { getUserByIDFromHub, getUserByEmailFromHub, validatePassword, validateUser } from "../../../../src/util/user/userValidation";

let bApp: Express;

const HTTP_OK: number = 200;
const HTTP_FAIL: number = 401;

const testHubUser: User = new User();

testHubUser.name = "Billy Tester II";
testHubUser.email = "billyII@testing.com";
testHubUser.password = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";
testHubUser.authLevel = 1;
testHubUser.team = "TeamCodeHere-";
testHubUser.repo = "tests2.git";

/**
 * Preparing for the tests
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp(async (builtApp: Express, err: Error): Promise<void> => {
    if (err) {
      console.error("Could not start server!");
      done();
    } else {
      bApp = builtApp;

      // Creating the test user in the hub
      testHubUser.id = (await getConnection("hub")
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([testHubUser])
        .execute()).identifiers[0].id;
      done();
    }
  });
});


/**
 * User validation tests
 */
describe("User validation tests", (): void => {
  /**
   * Test if the the user exists in the hub
   */
  test("Should ensure the test user exists in the hub database", async (): Promise<void> => {
    const hubUser: User = await getUserByEmailFromHub(testHubUser.email);
    expect(hubUser.id).toBe(testHubUser.id);
  });

  /**
   * Test if the the sumbitted email is in the database and has a valid password
   */
  test("Should ensure the test user exists and has valid password", async (): Promise<void> => {
    const user: User = await getUserByEmailFromHub(testHubUser.email);
    expect(user.id).toBe(testHubUser.id);

    const validTestUser: boolean = await validateUser(testHubUser.email, "password123");
    expect(validTestUser).toBeTruthy();
    const invalidTestUser: boolean = await validateUser("doesnotwork@test.com", "randompassword");
    expect(invalidTestUser).toBeFalsy();
  });

  /**
   * Test the user can be selected from the database using a unique id
   */
  test("Should ensure the user can be selected from the database using a unique id", async (): Promise<void> => {
    const user: User = await getUserByIDFromHub(testHubUser.id);
    expect(user).toBeDefined();
    expect(user.id).toBe(testHubUser.id);
  });

  /**
   * Test the user can be selected from the database using a unique id
   */
  test("Should ensure the user can be selected from the database using a unique id", async (): Promise<void> => {
    const user: User = await getUserByIDFromHub(testHubUser.id);
    expect(user).toBeDefined();
    expect(user.id).toBe(testHubUser.id);
  });

  /**
   * Test if the password validation function works as expected
   */
  test("Should ensure that hashed passwords are validated correctly", async (): Promise<void> => {
    const hashedPassword: string = "pbkdf2_sha512$40000$R*Tx2p|70i@vaRM*]Nv6j5=RtLY$x6E2s9AD/6V5I78wGXjmYmn4D1vfd+XggaYWksWsQO4=";
    let plaintextPassword: string = "testPassword123";
    expect(validatePassword(plaintextPassword, hashedPassword)).toBeTruthy();

    plaintextPassword = "No-longer-valid";
    expect(validatePassword(plaintextPassword, hashedPassword)).toBeFalsy();
  });

  /**
   * Test that an expected error is thrown when trying to get a user's password and the connection to the DB is closed
   */
  test("Should not log in when disconnected from hub database", async (): Promise<void> => {
    await getConnection("hub").close();

    await createConnection({
      name: "hub",
      type: "mysql",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        User,
        HardwareItem,
        ReservedHardwareItem
      ],
      synchronize: true,
      logging: false
    });
  });


});

/**
 * Cleaning up after the tests
 */
afterAll(async (): Promise<void> => {
  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: testHubUser.id })
    .execute();

  await getConnection("applications").close();
  await getConnection("hub").close();
});
