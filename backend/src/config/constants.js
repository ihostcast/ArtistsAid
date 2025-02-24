// Artist Types
exports.ARTIST_TYPES = {
  MUSICIAN: 'musician',
  ACTOR: 'actor',
  DANCER: 'dancer',
  VISUAL_ARTIST: 'visual_artist',
  WRITER: 'writer',
  JOURNALIST: 'journalist',
  BROADCASTER: 'broadcaster',
  CULTURAL_PROMOTER: 'cultural_promoter',
  OTHER: 'other'
};

// Cause Categories
exports.CAUSE_CATEGORIES = {
  MEDICAL: 'medical',
  FUNERAL: 'funeral',
  BASIC_NEEDS: 'basic_needs',
  EQUIPMENT: 'equipment',
  EDUCATION: 'education',
  EMERGENCY: 'emergency',
  PROJECT: 'project'
};

// Cause Status
exports.CAUSE_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  NEEDS_INFO: 'needs_info',
  APPROVED: 'approved',
  FUNDED: 'funded',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

// Verification Types
exports.VERIFICATION_TYPES = {
  ID_DOCUMENT: 'id_document',
  PROFESSIONAL_CERTIFICATE: 'professional_certificate',
  PORTFOLIO: 'portfolio',
  SOCIAL_MEDIA: 'social_media',
  RECOMMENDATIONS: 'recommendations',
  PRESS_COVERAGE: 'press_coverage'
};

// Document Types
exports.DOCUMENT_TYPES = {
  MEDICAL_PRESCRIPTION: 'medical_prescription',
  DEATH_CERTIFICATE: 'death_certificate',
  INVOICE: 'invoice',
  RECEIPT: 'receipt',
  BUDGET: 'budget',
  CONTRACT: 'contract',
  PROOF_OF_WORK: 'proof_of_work'
};

// User Roles
exports.USER_ROLES = {
  ARTIST: 'artist',
  VERIFIER: 'verifier',
  FINANCIAL: 'financial',
  ADMIN: 'admin',
  CONTRIBUTOR: 'contributor',
  EDITOR: 'editor'
};

// News Categories
exports.NEWS_CATEGORIES = {
  PLATFORM: 'platform',
  MUSIC: 'music',
  SOLIDARITY: 'solidarity',
  EVENTS: 'events',
  ANNOUNCEMENTS: 'announcements'
};

// FAQ Categories
exports.FAQ_CATEGORIES = {
  GENERAL: 'general',
  REGISTRATION: 'registration',
  VERIFICATION: 'verification',
  CAUSES: 'causes',
  DONATIONS: 'donations',
  PLATFORM: 'platform'
};

// Common Tags
exports.COMMON_TAGS = [
  'música',
  'solidaridad',
  'eventos',
  'artistas',
  'causas',
  'donaciones',
  'comunidad',
  'entretenimiento',
  'cultura'
];

// Fund Distribution Rules
exports.FUND_DISTRIBUTION = {
  EMERGENCY_MAX: 5000,
  BASIC_NEEDS_MAX: 2000,
  MEDICAL_MAX: 10000,
  FUNERAL_MAX: 5000,
  PROJECT_MAX: 15000
};
