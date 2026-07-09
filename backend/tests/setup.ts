import { closeDB } from "../src/config/database";

afterAll(async () => {
  await closeDB();
});
