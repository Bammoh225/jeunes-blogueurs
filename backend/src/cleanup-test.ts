import { pool } from './config/database';

async function cleanup() {
  try {
    console.log('Suppression des données de test...');
    
    // Trouver les utilisateurs de test
    const [testUsers]: any = await pool.query("SELECT id FROM utilisateurs WHERE email LIKE 'testuser%@example.com'");
    const userIds = testUsers.map((u: any) => u.id);
    
    if (userIds.length > 0) {
      // Supprimer les publications des utilisateurs de test
      console.log(`Suppression des publications pour ${userIds.length} utilisateurs de test...`);
      // Since MySQL doesn't support array directly in IN (?) if it's too large, we can just delete by matching titre
      const [pubResult]: any = await pool.query("DELETE FROM publications WHERE titre LIKE 'Publication de Test % - 2026'");
      console.log(`Publications supprimées: ${pubResult.affectedRows}`);

      console.log('Suppression des utilisateurs de test...');
      const [userResult]: any = await pool.query("DELETE FROM utilisateurs WHERE email LIKE 'testuser%@example.com'");
      console.log(`Utilisateurs supprimés: ${userResult.affectedRows}`);
    } else {
      console.log('Aucun utilisateur de test trouvé.');
      // Au cas où, on nettoie aussi les publications par titre
      const [pubResult]: any = await pool.query("DELETE FROM publications WHERE titre LIKE 'Publication de Test % - 2026'");
      console.log(`Publications supprimées: ${pubResult.affectedRows}`);
    }

    console.log('Nettoyage terminé avec succès.');
  } catch (error) {
    console.error('Erreur lors du nettoyage :', error);
  } finally {
    pool.end();
  }
}

cleanup();
