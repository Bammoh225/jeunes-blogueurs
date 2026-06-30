import { Router } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { categorie_id } = req.query;
    let query = 'SELECT * FROM thematiques ORDER BY nom ASC';
    const params: any[] = [];

    if (categorie_id) {
      query = 'SELECT * FROM thematiques WHERE categorie_id = ? ORDER BY nom ASC';
      params.push(+categorie_id);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    sendSuccess(res, rows);
  } catch (err: any) {
    sendError(res, err.message);
  }
});

export default router;
