import { type Request, type Response } from 'express';
import LanguageService from '../services/language.service';
import { getUserIdFromToken } from '../utils/userUtils';

class LanguageController {
  async setLanguage(req: Request, res: Response): Promise<void> {
    try {
      const { lang } = req.params;
      const userId = getUserIdFromToken(req.headers);

      await req.i18n.changeLanguage(lang);
      await LanguageService.setLanguage(lang, Number(userId));

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }
}

export default new LanguageController();
