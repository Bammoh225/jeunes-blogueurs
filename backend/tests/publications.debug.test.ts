import request from "supertest";
import app from "../src/app";

test("DEBUG publications endpoint", async () => {

  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: "antoine.marc@jb.ci",
      mot_de_passe: "Password123"
    });

  const token = login.body.data.token;

  const res = await request(app)
    .post("/api/publications")
    .set("Authorization", `Bearer ${token}`)
    .send({
      titre: "test",
      contenu: "test content"
    });

  console.log("STATUS:", res.status);
  console.log("BODY:", res.body);

  expect(true).toBe(true);
});

