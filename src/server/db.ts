/**
 * RecoverPath - In-Memory Database & Seed Generator
 */
import bcrypt from 'bcryptjs';
import { User, SafetyPlan, EducationArticle, HelpResource, CrisisAlertLog, CrisisSession } from '../types.js';

class MockDatabase {
  users: Map<string, User> = new Map();
  userPasswords: Map<string, string> = new Map(); // email -> hashedPassword
  safetyPlans: Map<string, SafetyPlan> = new Map();
  educationArticles: EducationArticle[] = [];
  helpResources: HelpResource[] = [];
  crisisLogs: CrisisAlertLog[] = [];
  crisisSessions: CrisisSession[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const passwordHash = bcrypt.hashSync('password123', 10);

    // Seed Demo Users
    const maya: User = {
      id: 'usr_maya_101',
      email: 'maya@recoverpath.org',
      name: 'Maya Lin',
      role: 'individual',
      sobrietyStartDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(), // ~8 months sober
      primarySubstance: 'Opioids (Prescription / Heroin)',
      linkedUserId: 'usr_david_202',
      linkedUserName: 'David Lin (Father)',
      consentScope: {
        shareStreak: true,
        shareEmergencyAlerts: true,
        shareSafetyPlan: true,
        shareCheckinStatus: true,
      },
    };

    const david: User = {
      id: 'usr_david_202',
      email: 'david@recoverpath.org',
      name: 'David Lin',
      role: 'caregiver',
      linkedUserId: 'usr_maya_101',
      linkedUserName: 'Maya Lin (Daughter)',
      consentScope: {
        shareStreak: true,
        shareEmergencyAlerts: true,
        shareSafetyPlan: true,
        shareCheckinStatus: true,
      },
    };

    this.users.set(maya.id, maya);
    this.users.set(david.id, david);
    this.userPasswords.set('maya@recoverpath.org', passwordHash);
    this.userPasswords.set('david@recoverpath.org', passwordHash);

    // Seed Maya's Safety Plan
    const mayaSafetyPlan: SafetyPlan = {
      id: 'plan_maya_001',
      userId: maya.id,
      warningSigns: [
        'Feeling overwhelming tension in throat and chest on Friday nights',
        'Isolating from calls and leaving messages unread',
        'Intense thoughts of past prescribing doctors or old associates',
        'Physical restlessness and pacing around apartment'
      ],
      copingStrategies: [
        'Perform 4-7-8 breathing exercise for 3 full cycles',
        'Splash cold water on face and hold ice cube in palm for 30 seconds',
        'Call David (Father) or Sponsor (Sarah) immediately',
        'Listen to calming ambient ocean soundscapes'
      ],
      safePlaces: [
        'Living room with dog (Buster) and weighted blanket',
        'Community Recovery Center on 4th Street',
        'Local public library quiet reading garden'
      ],
      supportContacts: [
        { name: 'David Lin (Father)', relation: 'Caregiver / Family', phone: '555-019-2831' },
        { name: 'Sarah M.', relation: 'Sponsor (NA)', phone: '555-014-9922' },
        { name: 'Dr. Evelyn Vance', relation: 'Therapist', phone: '555-018-3341' }
      ],
      reasonsToStaySober: [
        'To be present and healthy for my younger sister’s graduation',
        'Maintaining my graphic design career and independence',
        'Waking up without fear, shame, or physical withdrawal',
        'Rebuilding trust with my father David'
      ],
      emergencyNotes: 'If I am in immediate distress, call David or 988. I prefer calm, non-judgmental tone.',
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.safetyPlans.set(maya.id, mayaSafetyPlan);

    // Seed Educational Articles
    this.educationArticles = [
      {
        id: 'edu_001',
        title: 'De-escalating Cravings: The 15-Minute Neuro-Wave',
        category: 'relapse_prevention',
        readTime: '3 min',
        summary: 'Understand why cravings feel irresistible and how neurochemical spikes naturally subside within 15 to 20 minutes if unassisted by fear.',
        fullText: `Cravings feel like permanent, escalating emergencies, but neurobiological research proves they operate like ocean waves. A craving is caused by a sudden release of dopamine in response to external or internal cues (stress, exhaustion, familiar locations). 

When a craving strikes, the brain's emotional center (amygdala) signals immediate danger, causing heart rate elevation and tunnel vision. However, without re-stimulation, the neurochemical surge peaks at around 5-7 minutes and naturally dissipates within 15-20 minutes.

Key Grounding Strategy: "Surfing the Urge". Instead of fighting or analyzing the craving, observe it as a physical sensation. Notice where it resides in your body (tight throat, clenched fists, butterfly stomach). Remind yourself out loud: "This is a chemical wave. It will peak and fall. I do not have to act."`,
        keyTakeaways: [
          'Cravings naturally subside in 15-20 minutes without action.',
          'Fighting or panicking increases cortisol, making cravings feel longer.',
          'Physical grounding (ice, cold water, breathing) disrupts the surge.'
        ],
        source: 'SAMHSA Recovery Evidence Series & NIDA Guidelines'
      },
      {
        id: 'edu_002',
        title: 'Caregiver Guide: Supportive Presence vs. Enabling',
        category: 'caregiver_support',
        readTime: '4 min',
        summary: 'Learn the critical difference between supporting a loved one in SUD recovery and unintentionally protecting them from natural accountability.',
        fullText: `For caregivers and family members, supporting someone with Substance Use Disorder is emotionally grueling. The instinct to save or protect can blur the line between healthy support and enabling.

Supportive Presence means:
1. Validating emotions without accepting unsafe behavior ("I hear how painful this is for you, and I am here with you, but I cannot give you money").
2. Staying calm during high-stress conversations to keep their prefrontal cortex engaged.
3. Offering connection to professional resources rather than taking on clinical duties.

Enabling means:
1. Making excuses, covering up consequences, or providing unmonitored financial funds.
2. Shielding the individual from experiencing the legal or personal outcomes of active use.

Remember: Boundaries are not punishment. Clear, loving boundaries create a safe container where recovery becomes possible.`,
        keyTakeaways: [
          'Validation is acknowledging pain; enabling is removing natural consequences.',
          'Keep voice tone calm and neutral during emotional spikes.',
          'Caregivers must prioritize their own safety and mental wellness first.'
        ],
        source: 'National Council on Alcoholism and Drug Dependence (NCADD)'
      },
      {
        id: 'edu_003',
        title: 'Understanding Medication-Assisted Treatment (MAT)',
        category: 'mat_treatment',
        readTime: '4 min',
        summary: 'Demystifying Buprenorphine, Methadone, and Naltrexone — evidence-based medications that stabilize brain chemistry.',
        fullText: `Medication-Assisted Treatment (MAT) combines FDA-approved medications with counseling and behavioral therapies for a "whole-patient" approach to opioid and alcohol use disorders.

MAT medications do not replace one addiction with another. Under medical supervision, medications like Buprenorphine (Suboxone) or Methadone bind to opioid receptors in the brain to eliminate cravings and withdrawal symptoms without producing euphoria. Naltrexone (Vivitrol) blocks opioid receptors entirely.

Clinical evidence shows that MAT reduces overdose mortality rates by over 50%, improves treatment retention, and allows individuals to regain daily stability, work, and family life.`,
        keyTakeaways: [
          'MAT is clinically proven to reduce mortality by over 50%.',
          'Medications normalize brain chemistry without causing impairment.',
          'Combining MAT with therapy yields the highest long-term success.'
        ],
        source: 'National Institute on Drug Abuse (NIDA) & SAMHSA'
      },
      {
        id: 'edu_004',
        title: 'Harm Reduction Essentials & Overdose Prevention',
        category: 'harm_reduction',
        readTime: '3 min',
        summary: 'Essential life-saving knowledge on Naloxone (Narcan), fentanyl test strips, and emergency response steps.',
        fullText: `Harm reduction is a pragmatic, compassionate approach aimed at keeping people alive and minimizing the negative health consequences of substance use.

1. Naloxone (Narcan): An opioid antagonist that rapidly reverses an opioid overdose. It is safe, easy to administer via nasal spray, and will not cause harm if given to someone who isn't suffering from an opioid overdose.
2. Recognizing Overdose Signs: Unconsciousness, slow or absent breathing, blue/gray lips or fingernails, pinpoint pupils, cold/clammy skin.
3. Emergency Protocol: Call 911 immediately, administer Naloxone, place the person in the recovery position (on their side), and perform rescue breathing if trained. Stay until emergency services arrive.`,
        keyTakeaways: [
          'Naloxone is safe, nasal-administered, and over-the-counter.',
          'Always call 911 first during a suspected overdose.',
          'Good Samaritan laws protect bystanders calling for help in most regions.'
        ],
        source: 'CDC Overdose Prevention & Harm Reduction International'
      },
      {
        id: 'edu_005',
        title: 'Building a Crisis-Ready Personal Safety Plan',
        category: 'understanding_sud',
        readTime: '3 min',
        summary: 'Why having a pre-written, calm-state safety plan saves lives when cognitive load spikes.',
        fullText: `During moments of intense stress, craving, or trauma triggers, the brain enters "fight-or-flight" mode. The prefrontal cortex—responsible for complex reasoning, memory retrieval, and decision-making—goes offline.

This is why trying to figure out what to do during a crisis fails. A Personal Safety Plan acts as an external brain. Created during a calm, stable state, it clearly lists your early warning signs, 1-tap coping actions, safe physical environments, and designated emergency contacts.

When crisis strikes, you do not think—you simply open your plan and follow step one.`,
        keyTakeaways: [
          'Panic bypasses decision-making; pre-written plans eliminate thinking.',
          'Review and update your safety plan monthly with your support team.',
          'Ensure your caregiver or sponsor has access to your plan.'
        ],
        source: 'American Psychological Association (APA) & Crisis Guidelines'
      }
    ];

    // Seed Help Resources
    this.helpResources = [
      {
        id: 'res_988',
        name: '988 Suicide & Crisis Lifeline',
        type: 'hotline',
        phone: '988',
        hours: '24/7, 365 Days',
        description: 'Free, confidential support for anyone in suicidal distress, substance crisis, or emotional pain. Call or text 988.',
        isNational: true,
      },
      {
        id: 'res_samhsa',
        name: 'SAMHSA National Helpline',
        type: 'hotline',
        phone: '1-800-662-4357',
        hours: '24/7, 365 Days',
        description: 'Substance Abuse and Mental Health Services Administration confidential treatment referral and information service in English and Spanish.',
        isNational: true,
      },
      {
        id: 'res_crisistext',
        name: 'Crisis Text Line',
        type: 'hotline',
        phone: '741741',
        hours: '24/7',
        description: 'Free crisis counseling via text. Text HOME to 741741 to connect with a crisis counselor.',
        isNational: true,
      },
      {
        id: 'res_center_01',
        name: 'Metro Recovery & Wellness Center',
        type: 'treatment_center',
        phone: '555-019-8822',
        address: '1420 Community Way, Suite 300',
        hours: 'Mon-Sun 8:00 AM - 8:00 PM',
        description: 'Comprehensive outpatient SUD treatment, MAT medical support, group counseling, and family therapy sessions.',
        isNational: false,
      },
      {
        id: 'res_group_01',
        name: 'SMART Recovery Local Group (Community Center)',
        type: 'support_group',
        phone: '555-012-3390',
        address: '500 Central Ave, Room 204',
        hours: 'Tuesdays & Thursdays @ 7:00 PM',
        description: 'Self-Empowerment and Mutual-Help recovery group focusing on cognitive behavioral tools for addiction recovery.',
        isNational: false,
      }
    ];

    // Seed recent crisis alerts
    this.crisisLogs = [
      {
        id: 'log_001',
        individualId: maya.id,
        individualName: maya.name,
        caregiverId: david.id,
        feeling: 'anxiety',
        safetyStatus: 'uncomfortable',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        acknowledged: true,
      }
    ];
  }

  // User helper methods
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getSafetyPlan(userId: string): SafetyPlan | undefined {
    return this.safetyPlans.get(userId);
  }

  saveSafetyPlan(plan: SafetyPlan): SafetyPlan {
    this.safetyPlans.set(plan.userId, plan);
    return plan;
  }

  addCrisisLog(log: CrisisAlertLog) {
    this.crisisLogs.unshift(log);
  }

  getCrisisLogs(caregiverId: string): CrisisAlertLog[] {
    return this.crisisLogs.filter(l => l.caregiverId === caregiverId);
  }
}

export const db = new MockDatabase();
