import request from "supertest";
import app from "../src/app";

test("DEBUG - check user role", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "antoine.marc@jb.ci",
      mot_de_passe: "Password123"
    });

  console.log(res.body.data);

  expect(res.status).toBe(200);
});
