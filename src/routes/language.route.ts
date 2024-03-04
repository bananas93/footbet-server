import { Router } from 'express';
import LanguageController from '../controllers/language.controller';

const router: Router = Router();

router.get('/:lang', async (req, res) => {
  await LanguageController.setLanguage(req, res);
});

export default router;
