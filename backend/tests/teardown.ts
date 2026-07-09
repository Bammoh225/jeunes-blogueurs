import { closeDB } from '../src/config/database';

module.exports = async () => {
  await closeDB();
};
