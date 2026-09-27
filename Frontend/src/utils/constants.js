/**
 * LEGAL METRIX - System Constants & Enumerations
 * Smart India Hackathon 2026 | Problem Statement 26034
 */

// Reusable Compliance Statuses
// Note: Detections are labeled 'POTENTIAL_VIOLATION' - not final legal determinations.
export const COMPLIANCE_STATUS = {
  COMPLIANT: 'COMPLIANT',
  POTENTIAL_VIOLATION: 'POTENTIAL_VIOLATION',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  INVALIDATED: 'INVALIDATED',
};

export const STATUS_LABELS = {
  [COMPLIANCE_STATUS.COMPLIANT]: 'Compliant',
  [COMPLIANCE_STATUS.POTENTIAL_VIOLATION]: 'Potential Violation',
  [COMPLIANCE_STATUS.NEEDS_REVIEW]: 'Needs Review',
  [COMPLIANCE_STATUS.PENDING]: 'Pending',
  [COMPLIANCE_STATUS.CONFIRMED]: 'Confirmed',
  [COMPLIANCE_STATUS.INVALIDATED]: 'Invalidated',
};

// Risk Levels
export const RISK_LEVEL = {
  HIGH_RISK: 'HIGH_RISK',
  MEDIUM_RISK: 'MEDIUM_RISK',
  LOW_RISK: 'LOW_RISK',
};

export const RISK_LABELS = {
  [RISK_LEVEL.HIGH_RISK]: 'High Risk',
  [RISK_LEVEL.MEDIUM_RISK]: 'Medium Risk',
  [RISK_LEVEL.LOW_RISK]: 'Low Risk',
};

// Legal Metrology (Packaged Commodities) Rules, 2011 Mandatory Declarations
export const LEGAL_METROLOGY_RULES = [
  {
    ruleCode: 'RULE_6_1_A',
    ruleTitle: 'Rule 6(1)(a)',
    description: 'Name and complete address of the manufacturer, packer, or importer',
    mandatory: true,
  },
  {
    ruleCode: 'RULE_6_1_B',
    ruleTitle: 'Rule 6(1)(b)',
    description: 'Common or generic names of the commodity contained in the package',
    mandatory: true,
  },
  {
    ruleCode: 'RULE_6_1_C',
    ruleTitle: 'Rule 6(1)(c)',
    description: 'Net quantity in terms of standard unit of weight, measure or number',
    mandatory: true,
  },
  {
    ruleCode: 'RULE_6_1_D',
    ruleTitle: 'Rule 6(1)(d)',
    description: 'Month and year in which commodity is manufactured, packed or imported',
    mandatory: true,
  },
  {
    ruleCode: 'RULE_6_1_E',
    ruleTitle: 'Rule 6(1)(e)',
    description: 'Maximum Retail Price (MRP) inclusive of all taxes',
    mandatory: true,
  },
  {
    ruleCode: 'RULE_6_1_F',
    ruleTitle: 'Rule 6(1)(f)',
    description: 'Name, address, telephone number, email of the consumer care cell',
    mandatory: true,
  },
  {
    ruleCode: 'RULE_6_1_G',
    ruleTitle: 'Rule 6(1)(g)',
    description: 'Country of origin for imported commodities',
    mandatory: true,
  },
  {
    ruleCode: 'RULE_18',
    ruleTitle: 'Rule 18',
    description: 'Prohibition against sale at price higher than MRP / Dual Pricing',
    mandatory: true,
  },
];

// Navigation Items for Sidebar & Routing
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    iconName: 'LayoutDashboard',
    description: 'Enforcement overview and key metrics',
  },
  {
    id: 'scan',
    label: 'Scan Product',
    path: '/scan',
    iconName: 'ScanLine',
    description: 'Capture & ingest commodity package labels',
  },
  {
    id: 'analysis',
    label: 'Compliance Analysis',
    path: '/analysis',
    iconName: 'Scale',
    description: 'PCR 2011 rule verification & detections',
  },
  {
    id: 'evidence',
    label: 'Violation Evidence',
    path: '/evidence',
    iconName: 'FileSearch',
    description: 'Visual OCR bounding boxes & extracted proof',
  },
  {
    id: 'verification',
    label: 'Officer Verification',
    path: '/verification',
    iconName: 'ShieldCheck',
    description: 'Legal determination & notice issuance desk',
  },
  {
    id: 'history',
    label: 'Product History',
    path: '/history',
    iconName: 'History',
    description: 'Audit trails and commodity catalog logs',
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    path: '/reports',
    iconName: 'BarChart3',
    description: 'Enforcement intelligence and export summaries',
  },
];

// Officer Roles
export const USER_ROLES = {
  INSPECTION_OFFICER: 'INSPECTION_OFFICER',
  SENIOR_ENFORCEMENT_OFFICER: 'SENIOR_ENFORCEMENT_OFFICER',
  ADMIN: 'ADMIN',
};

// ============================================================================
// SCAN & IMAGE ACQUISITION CONSTANTS
// ============================================================================

// Frontend image quality assessment states
export const IMAGE_QUALITY = {
  PENDING: 'PENDING',
  GOOD: 'GOOD',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  UNCLEAR: 'UNCLEAR',
};

// Per-image upload status
export const UPLOAD_STATUS = {
  EMPTY: 'EMPTY',
  VALIDATING: 'VALIDATING',
  READY: 'READY',
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  FAILED: 'FAILED',
};

// Backend analysis pipeline states
export const ANALYSIS_STATUS = {
  IDLE: 'IDLE',
  UPLOADING: 'UPLOADING',
  QUALITY_CHECK: 'QUALITY_CHECK',
  LABEL_DETECTION: 'LABEL_DETECTION',
  OCR_EXTRACTION: 'OCR_EXTRACTION',
  COMPLIANCE_ANALYSIS: 'COMPLIANCE_ANALYSIS',
  COMPLETE: 'COMPLETE',
  FAILED: 'FAILED',
};

// Image view slot labels
export const IMAGE_VIEWS = ['Front View', 'Back View', 'Side View', 'Additional View'];

// Configurable frontend validation limits
// These can be adjusted when the backend teammate specifies actual server limits.
export const SCAN_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MIN_IMAGE_WIDTH: 200,
  MIN_IMAGE_HEIGHT: 200,
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_EXTENSIONS: '.jpg,.jpeg,.png,.webp',
  MAX_IMAGES: 4,
};

// ============================================================================
// PHASE 6: OFFICER VERIFICATION CONSTANTS
// ============================================================================

export const REVIEW_STATUS = {
  PENDING_OFFICER_REVIEW: 'PENDING_OFFICER_REVIEW',
  COMPLETED: 'COMPLETED',
};

export const OFFICER_DECISION = {
  CONFIRM_FINDING: 'CONFIRM_FINDING',
  INVALIDATE_FINDING: 'INVALIDATE_FINDING',
  NEEDS_FURTHER_REVIEW: 'NEEDS_FURTHER_REVIEW',
};
