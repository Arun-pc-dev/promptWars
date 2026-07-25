import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { AIService } from './src/server/aiService.js';
import { CrisisInterventionRequest, CaregiverScriptRequest } from './src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'recoverpath_super_secret_jwt_key_2026';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware: Auth token parser
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      // Default to Maya for seamless demo testing if token missing
      (req as any).user = db.getUserById('usr_maya_101');
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        (req as any).user = db.getUserById('usr_maya_101');
      } else {
        (req as any).user = db.getUserById(decoded.id);
      }
      next();
    });
  };

  // --- API ROUTES ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'RecoverPath API Engine', timestamp: new Date().toISOString() });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.getUserByEmail(email);
    const storedHash = db.userPasswords.get(email.toLowerCase());

    if (!user || !storedHash || !bcrypt.compareSync(password, storedHash)) {
      return res.status(401).json({ error: 'Invalid credentials. Demo accounts: maya@recoverpath.org / password123 or david@recoverpath.org / password123' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  });

  // Auth: Current User
  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });

  // Profile update & consent toggle
  app.put('/api/profile', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { consentScope, sobrietyStartDate, primarySubstance } = req.body;
    if (consentScope) user.consentScope = { ...user.consentScope, ...consentScope };
    if (sobrietyStartDate) user.sobrietyStartDate = sobrietyStartDate;
    if (primarySubstance) user.primarySubstance = primarySubstance;

    res.json({ user, message: 'Profile updated successfully' });
  });

  // Zero-Typing Crisis Intervention (Pillar 1)
  app.post('/api/crisis/intervention', authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const interventionReq: CrisisInterventionRequest = req.body;

      const safetyPlan = db.getSafetyPlan(user?.id || 'usr_maya_101');
      const response = await AIService.generateCrisisIntervention(interventionReq, safetyPlan);

      // Save crisis session record
      db.crisisSessions.unshift({
        id: response.id,
        userId: user?.id || 'usr_maya_101',
        safetyStatus: interventionReq.safetyStatus,
        triggerType: interventionReq.feeling,
        aiGroundingText: response.groundingText,
        suggestedAction: response.actionSteps.join('; '),
        contactNotified: false,
        timestamp: response.timestamp,
      });

      res.json(response);
    } catch (err) {
      console.error('Error in crisis intervention route:', err);
      res.status(500).json({ error: 'Crisis intervention processing failed' });
    }
  });

  // Notify Support Contact (Pillar 1 - 1-tap dispatch)
  app.post('/api/crisis/notify-contact', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const { feeling, safetyStatus } = req.body;

    const alertLog = {
      id: `alert_${Date.now()}`,
      individualId: user?.id || 'usr_maya_101',
      individualName: user?.name || 'Maya Lin',
      caregiverId: user?.linkedUserId || 'usr_david_202',
      feeling: feeling || 'high_stress',
      safetyStatus: safetyStatus || 'uncomfortable',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    db.addCrisisLog(alertLog);

    res.json({
      success: true,
      message: `Safety alert dispatched to ${user?.linkedUserName || 'David Lin (Caregiver)'}`,
      alertLog,
    });
  });

  // Personalized Emergency Script Generator (Pillar 2 - Caregiver Mode)
  app.post('/api/caregiver/script', authenticateToken, async (req, res) => {
    try {
      const scriptReq: CaregiverScriptRequest = req.body;
      const user = (req as any).user;

      // Fetch linked individual's safety plan triggers if consent given
      let triggers: string[] = [];
      if (user?.linkedUserId) {
        const linkedPlan = db.getSafetyPlan(user.linkedUserId);
        if (linkedPlan) {
          triggers = linkedPlan.warningSigns;
        }
      }

      const script = await AIService.generateCaregiverScript(scriptReq, triggers);
      res.json(script);
    } catch (err) {
      console.error('Error generating caregiver script:', err);
      res.status(500).json({ error: 'Failed to generate emergency script' });
    }
  });

  // Caregiver Dashboard Data (Pillar 2 / Caregiver view)
  app.get('/api/caregiver/dashboard', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const linkedIndividual = user.linkedUserId ? db.getUserById(user.linkedUserId) : db.getUserById('usr_maya_101');
    const safetyPlan = linkedIndividual ? db.getSafetyPlan(linkedIndividual.id) : undefined;
    const alerts = db.getCrisisLogs(user.id);

    res.json({
      linkedIndividual: linkedIndividual ? {
        id: linkedIndividual.id,
        name: linkedIndividual.name,
        sobrietyStartDate: linkedIndividual.sobrietyStartDate,
        primarySubstance: linkedIndividual.primarySubstance,
        consentScope: linkedIndividual.consentScope,
      } : null,
      safetyPlan: linkedIndividual?.consentScope?.shareSafetyPlan ? safetyPlan : null,
      alerts,
    });
  });

  // Safety Plan (Pillar 4)
  app.get('/api/safety-plan', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const plan = db.getSafetyPlan(user?.id || 'usr_maya_101');
    res.json(plan || {});
  });

  app.put('/api/safety-plan', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const updatedPlan = {
      ...req.body,
      userId: user?.id || 'usr_maya_101',
      updatedAt: new Date().toISOString(),
    };
    db.saveSafetyPlan(updatedPlan);
    res.json(updatedPlan);
  });

  app.post('/api/safety-plan/ai-suggest', authenticateToken, async (req, res) => {
    const user = (req as any).user;
    const suggestions = await AIService.suggestSafetyPlanIdeas({
      primarySubstance: user?.primarySubstance,
    });
    res.json(suggestions);
  });

  // Educational Content Hub (Pillar 3)
  app.get('/api/education', (req, res) => {
    res.json(db.educationArticles);
  });

  app.post('/api/education/reformulate', async (req, res) => {
    const { articleId, mode } = req.body;
    const article = db.educationArticles.find(a => a.id === articleId);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const result = await AIService.reformulateArticle(article, mode || 'one_sentence');
    res.json(result);
  });

  // Nearby Help & Directory
  app.get('/api/resources', (req, res) => {
    res.json(db.helpResources);
  });

  // --- VITE MIDDLEWARE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RecoverPath Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
