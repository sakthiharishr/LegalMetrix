/**
 * LEGAL METRIX - Mock Data Layer
 * Mirrors future FastAPI backend schema responses for standalone frontend development.
 * 
 * IMPORTANT: Structured as frontend demonstration mock data.
 * Does not represent actual real-world government enforcement data.
 */

import { COMPLIANCE_STATUS, RISK_LEVEL, USER_ROLES, REVIEW_STATUS, OFFICER_DECISION } from '../utils/constants';

export const mockCurrentUser = {
  id: 'OFF-7842',
  name: 'Rajesh Kumar Verma',
  designation: 'Legal Metrology Inspector',
  badgeNumber: 'LM-DEL-2024-049',
  jurisdiction: 'New Delhi Central Enforcement Zone',
  role: USER_ROLES.SENIOR_ENFORCEMENT_OFFICER,
  email: 'r.verma.lm@delhi.gov.in',
  avatarUrl: null,
};

// ============================================================================
// 1. DASHBOARD SUMMARY METRICS
// ============================================================================
export const mockDashboardSummary = {
  totalScanned: 1248,
  totalScannedTrend: '+14.2% this month',
  compliant: 932,
  compliantTrend: '74.7% compliance rate',
  potentialViolations: 184,
  potentialViolationsTrend: 'Awaiting verification',
  needsReview: 76,
  needsReviewTrend: 'Pending officer inspection',
  highRisk: 56,
  highRiskTrend: 'Requires priority inspection',
};

// Legacy compatibility
export const mockDashboardMetrics = {
  totalScannedToday: 142,
  potentialViolationsCount: 29,
  pendingVerificationCount: 18,
  confirmedViolationsCount: 11,
  averageComplianceRate: 74.7,
  activeEnforcementAlerts: 3,
};

// ============================================================================
// 2. COMPLIANCE TRENDS OVER TIME (7D, 30D, 90D)
// ============================================================================
export const mockComplianceTrends = {
  '7d': [
    { label: '12 Sep', compliant: 118, potentialViolation: 24, needsReview: 10 },
    { label: '13 Sep', compliant: 125, potentialViolation: 22, needsReview: 12 },
    { label: '14 Sep', compliant: 140, potentialViolation: 28, needsReview: 9 },
    { label: '15 Sep', compliant: 132, potentialViolation: 19, needsReview: 14 },
    { label: '16 Sep', compliant: 145, potentialViolation: 26, needsReview: 11 },
    { label: '17 Sep', compliant: 152, potentialViolation: 31, needsReview: 8 },
    { label: '18 Sep', compliant: 120, potentialViolation: 29, needsReview: 12 },
  ],
  '30d': [
    { label: 'Week 1', compliant: 210, potentialViolation: 45, needsReview: 18 },
    { label: 'Week 2', compliant: 235, potentialViolation: 42, needsReview: 22 },
    { label: 'Week 3', compliant: 245, potentialViolation: 51, needsReview: 19 },
    { label: 'Week 4', compliant: 242, potentialViolation: 46, needsReview: 17 },
  ],
  '90d': [
    { label: 'July', compliant: 295, potentialViolation: 62, needsReview: 25 },
    { label: 'August', compliant: 318, potentialViolation: 58, needsReview: 27 },
    { label: 'September', compliant: 319, potentialViolation: 64, needsReview: 24 },
  ],
};

// ============================================================================
// 3. RISK DISTRIBUTION
// ============================================================================
export const mockRiskDistribution = {
  highRisk: { count: 56, percentage: 18, label: 'High Risk' },
  mediumRisk: { count: 98, percentage: 32, label: 'Medium Risk' },
  lowRisk: { count: 154, percentage: 50, label: 'Low Risk' },
  total: 308,
};

// ============================================================================
// 4. POTENTIAL VIOLATION CATEGORIES (PCR 2011)
// ============================================================================
export const mockViolationCategories = [
  {
    category: 'Mandatory Declaration Missing',
    rule: 'Rule 6(1) General',
    count: 64,
    percentage: 35,
    severity: 'HIGH',
  },
  {
    category: 'MRP Declaration & Numeral Size Issue',
    rule: 'Rule 6(1)(e)',
    count: 48,
    percentage: 26,
    severity: 'HIGH',
  },
  {
    category: 'Net Quantity & Unit Height Mismatch',
    rule: 'Rule 6(1)(c)',
    count: 32,
    percentage: 17,
    severity: 'MEDIUM',
  },
  {
    category: 'Manufacturer / Packer Incomplete Address',
    rule: 'Rule 6(1)(a)',
    count: 21,
    percentage: 11,
    severity: 'MEDIUM',
  },
  {
    category: 'Consumer Care Cell Details Omitted',
    rule: 'Rule 6(1)(f)',
    count: 11,
    percentage: 6,
    severity: 'LOW',
  },
  {
    category: 'Date / PKD Month-Year Format Error',
    rule: 'Rule 6(1)(d)',
    count: 8,
    percentage: 5,
    severity: 'LOW',
  },
];

// ============================================================================
// 5. HIGH-PRIORITY INSPECTIONS
// ============================================================================
export const mockHighPriorityInspections = [
  {
    id: 'CMD-2026-001',
    productName: 'NutriCrunch Wheat Biscuits (Family Pack)',
    barcode: '8901030948215',
    category: 'Packaged Food',
    risk: RISK_LEVEL.HIGH_RISK,
    finding: 'Potential Violation: MRP numeral height 1.5mm (statutory min: 2.5mm)',
    lastScan: '18 Sep 2026, 09:42',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    riskScore: 84,
  },
  {
    id: 'CMD-2026-004',
    productName: 'Classic Roasted Almonds 250g',
    barcode: '8904128901237',
    category: 'Dry Fruits & Nuts',
    risk: RISK_LEVEL.HIGH_RISK,
    finding: 'Potential Violation: Missing Country of Origin declaration',
    lastScan: '18 Sep 2026, 08:12',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    riskScore: 81,
  },
  {
    id: 'CMD-2026-005',
    productName: 'VitalGlow Multivitamin Capsules (60 count)',
    barcode: '8901248003112',
    category: 'Dietary Supplements',
    risk: RISK_LEVEL.HIGH_RISK,
    finding: 'Potential Violation: Dual pricing sticker detected over original MRP',
    lastScan: '18 Sep 2026, 07:45',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    riskScore: 88,
  },
  {
    id: 'CMD-2026-003',
    productName: 'SpeedMax Synthetic Engine Lubricant 1L',
    barcode: '8906002143099',
    category: 'Automotive Oils',
    risk: RISK_LEVEL.MEDIUM_RISK,
    finding: 'Needs Review: Packer address blurred (OCR confidence 62%)',
    lastScan: '18 Sep 2026, 08:50',
    status: COMPLIANCE_STATUS.NEEDS_REVIEW,
    riskScore: 64,
  },
  {
    id: 'CMD-2026-008',
    productName: 'EverFresh Premium Basmati Rice 5kg',
    barcode: '8901872110943',
    category: 'Grains & Staples',
    risk: RISK_LEVEL.MEDIUM_RISK,
    finding: 'Needs Review: Net quantity unit font ratio boundary check',
    lastScan: '17 Sep 2026, 17:30',
    status: COMPLIANCE_STATUS.NEEDS_REVIEW,
    riskScore: 58,
  },
];

// ============================================================================
// 6. RECENT INSPECTIONS ACTIVITY
// ============================================================================
export const mockRecentInspections = [
  {
    id: 'SCN-9941',
    productName: 'NutriCrunch Wheat Biscuits 400g',
    barcode: '8901030948215',
    timestamp: '2026-09-18T09:42:00Z',
    result: 'Flagged (68% score)',
    risk: RISK_LEVEL.HIGH_RISK,
    officer: 'LM-DEL-2024-049',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
  },
  {
    id: 'SCN-9940',
    productName: 'PureClean Anti-Bacterial Hand Wash 500ml',
    barcode: '8902519102441',
    timestamp: '2026-09-18T09:15:30Z',
    result: 'Compliant (98% score)',
    risk: RISK_LEVEL.LOW_RISK,
    officer: 'LM-DEL-2024-049',
    status: COMPLIANCE_STATUS.COMPLIANT,
  },
  {
    id: 'SCN-9939',
    productName: 'SpeedMax Synthetic Engine Lubricant 1L',
    barcode: '8906002143099',
    timestamp: '2026-09-18T08:50:12Z',
    result: 'Review Req. (82% score)',
    risk: RISK_LEVEL.MEDIUM_RISK,
    officer: 'LM-DEL-2024-012',
    status: COMPLIANCE_STATUS.NEEDS_REVIEW,
  },
  {
    id: 'SCN-9938',
    productName: 'Classic Roasted Almonds 250g',
    barcode: '8904128901237',
    timestamp: '2026-09-18T08:12:44Z',
    result: 'Flagged (61% score)',
    risk: RISK_LEVEL.HIGH_RISK,
    officer: 'LM-DEL-2024-049',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
  },
  {
    id: 'SCN-9937',
    productName: 'VitalGlow Multivitamin Capsules',
    barcode: '8901248003112',
    timestamp: '2026-09-18T07:45:00Z',
    result: 'Flagged (54% score)',
    risk: RISK_LEVEL.HIGH_RISK,
    officer: 'LM-DEL-2024-031',
    status: COMPLIANCE_STATUS.CONFIRMED,
  },
];

// ============================================================================
// 7. RECURRING COMPLIANCE PATTERNS (Key Differentiating Intelligence)
// ============================================================================
export const mockRecurringPatterns = [
  {
    id: 'PAT-001',
    pattern: 'Repeated MRP numeral height deficiency across multiple batches',
    occurrences: 14,
    manufacturer: 'GoldenHarvest Foods Ltd.',
    affectedProducts: 'NutriCrunch Biscuits, ChocoBite Cookies, GoldWafer Sticks',
    risk: RISK_LEVEL.HIGH_RISK,
    statusText: 'Pattern detected across 3 retail districts',
    actionRoute: '/verification',
    ruleViolated: 'Rule 6(1)(e)',
  },
  {
    id: 'PAT-002',
    pattern: 'Missing Country of Origin on imported California nuts packaging',
    occurrences: 9,
    manufacturer: 'NaturaDry Fruits Co.',
    affectedProducts: 'Roasted Almonds 250g, Walnuts 500g, Pistachios 200g',
    risk: RISK_LEVEL.HIGH_RISK,
    statusText: 'Pattern detected across recent import consignment',
    actionRoute: '/verification',
    ruleViolated: 'Rule 6(1)(g)',
  },
  {
    id: 'PAT-003',
    pattern: 'Consumer care electronic contact email omitted from secondary display',
    occurrences: 6,
    manufacturer: 'BioZenith Nutraceuticals',
    affectedProducts: 'Multivitamin Capsules, Omega-3 Fish Oil',
    risk: RISK_LEVEL.MEDIUM_RISK,
    statusText: 'Pattern detected in 2 product categories',
    actionRoute: '/verification',
    ruleViolated: 'Rule 6(1)(f)',
  },
];

// ============================================================================
// 8. SAMPLE RISK SCORE BREAKDOWN
// ============================================================================
export const mockSampleRiskScore = {
  score: 78,
  maxScore: 100,
  level: RISK_LEVEL.HIGH_RISK,
  inspectedProduct: 'NutriCrunch Wheat Biscuits (Family Pack)',
  breakdown: [
    { factor: 'Violation Severity', score: 32, max: 40, detail: 'Mandatory declaration font below schedule' },
    { factor: 'Repeat Pattern', score: 24, max: 30, detail: '3rd recurring finding for manufacturer in 30 days' },
    { factor: 'Historical Findings', score: 14, max: 20, detail: 'Previous non-compliance notices on record' },
    { factor: 'Recent Activity', score: 8, max: 10, detail: 'High scan frequency flagged in district' },
  ],
  advisoryNote:
    'Risk factors are generated by automated rule-assessment algorithms. The final legal determination belongs exclusively to the authorized officer.',
};

// ============================================================================
// 9. INTELLIGENCE NOTIFICATIONS & ALERTS
// ============================================================================
export const mockIntelligenceAlerts = [
  {
    id: 'alt-1',
    severity: 'urgent',
    message: '3 inspections require authorized officer verification.',
    actionLabel: 'Verify Now',
    route: '/verification',
  },
  {
    id: 'alt-2',
    severity: 'warning',
    message: '2 recurring non-compliance patterns detected across packaged confectionery.',
    actionLabel: 'View Patterns',
    route: '/analysis',
  },
  {
    id: 'alt-3',
    severity: 'info',
    message: '5 potential violations flagged today under PCR 2011 Rule 6.',
    actionLabel: 'Inspect Evidence',
    route: '/evidence',
  },
];

// Commodities catalog for backward compatibility
export const mockCommodities = [
  {
    id: 'CMD-2026-001',
    barcode: '8901030948215',
    productName: 'NutriCrunch Wheat Biscuits (Family Pack)',
    brand: 'GoldenHarvest Foods Ltd.',
    category: 'Packaged Food & Confectionery',
    scanTimestamp: '2026-09-18T09:42:00Z',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    riskLevel: RISK_LEVEL.HIGH_RISK,
    mrp: 120.0,
    declaredNetQty: '400 g',
    complianceScore: 68.5,
    flaggedRules: ['RULE_6_1_E', 'RULE_6_1_C'],
    summary: 'MRP font height below statutory minimum (1.5mm vs 2.5mm required for >200g pack)',
  },
  {
    id: 'CMD-2026-002',
    barcode: '8902519102441',
    productName: 'PureClean Anti-Bacterial Hand Wash 500ml',
    brand: 'Apex Personal Care Pvt Ltd',
    category: 'Cosmetics & Hygiene',
    scanTimestamp: '2026-09-18T09:15:30Z',
    status: COMPLIANCE_STATUS.COMPLIANT,
    riskLevel: RISK_LEVEL.LOW_RISK,
    mrp: 185.0,
    declaredNetQty: '500 ml',
    complianceScore: 98.2,
    flaggedRules: [],
    summary: 'All mandatory declarations verified compliant under PCR 2011',
  },
  {
    id: 'CMD-2026-003',
    barcode: '8906002143099',
    productName: 'SpeedMax Synthetic Engine Lubricant 1L',
    brand: 'PetroNova Lubes India',
    category: 'Automotive Oils',
    scanTimestamp: '2026-09-18T08:50:12Z',
    status: COMPLIANCE_STATUS.NEEDS_REVIEW,
    riskLevel: RISK_LEVEL.MEDIUM_RISK,
    mrp: 650.0,
    declaredNetQty: '1 L',
    complianceScore: 82.0,
    flaggedRules: ['RULE_6_1_A'],
    summary: 'Packer address OCR confidence 62% - blurred text requires manual verification',
  },
  {
    id: 'CMD-2026-004',
    barcode: '8904128901237',
    productName: 'Classic Roasted Almonds 250g',
    brand: 'NaturaDry Fruits Co.',
    category: 'Dry Fruits & Nuts',
    scanTimestamp: '2026-09-18T08:12:44Z',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    riskLevel: RISK_LEVEL.HIGH_RISK,
    mrp: 340.0,
    declaredNetQty: '250 g',
    complianceScore: 61.0,
    flaggedRules: ['RULE_6_1_D', 'RULE_6_1_G'],
    summary: 'Missing country of origin declaration on imported California almond batch',
  },
  {
    id: 'CMD-2026-005',
    barcode: '8901248003112',
    productName: 'VitalGlow Multivitamin Capsules (60 count)',
    brand: 'BioZenith Nutraceuticals',
    category: 'Dietary Supplements',
    scanTimestamp: '2026-09-18T07:45:00Z',
    status: COMPLIANCE_STATUS.CONFIRMED,
    riskLevel: RISK_LEVEL.HIGH_RISK,
    mrp: 899.0,
    declaredNetQty: '60 Capsules',
    complianceScore: 54.0,
    flaggedRules: ['RULE_18'],
    summary: 'Dual pricing sticker detected over original pre-printed MRP',
  },
];

export const mockRuleAnalysis = [
  {
    ruleCode: 'RULE_6_1_A',
    ruleTitle: 'Rule 6(1)(a) - Manufacturer / Packer Identity',
    status: COMPLIANCE_STATUS.COMPLIANT,
    extractedValue: 'Manufactured by: Apex Personal Care Pvt Ltd, Plot 14, Sector 8, IMT Manesar, Haryana 122051',
    confidenceScore: 96.4,
    notes: 'Complete manufacturing address and postal code verified.',
  },
  {
    ruleCode: 'RULE_6_1_B',
    ruleTitle: 'Rule 6(1)(b) - Generic Commodity Name',
    status: COMPLIANCE_STATUS.COMPLIANT,
    extractedValue: 'Hand Wash Liquid Soap',
    confidenceScore: 98.1,
    notes: 'Generic name clearly visible on primary display panel.',
  },
  {
    ruleCode: 'RULE_6_1_C',
    ruleTitle: 'Rule 6(1)(c) - Net Quantity & Font Spec',
    status: COMPLIANCE_STATUS.COMPLIANT,
    extractedValue: 'Net Qty: 500 ml (Font height: 4.1 mm)',
    confidenceScore: 94.7,
    notes: 'Exceeds minimum font height standard of 4 mm for 500ml container.',
  },
  {
    ruleCode: 'RULE_6_1_D',
    ruleTitle: 'Rule 6(1)(d) - Packing Month & Year',
    status: COMPLIANCE_STATUS.COMPLIANT,
    extractedValue: 'PKD: 08/2026',
    confidenceScore: 95.0,
    notes: 'Compliant MM/YYYY format present.',
  },
  {
    ruleCode: 'RULE_6_1_E',
    ruleTitle: 'Rule 6(1)(e) - Maximum Retail Price (MRP)',
    status: COMPLIANCE_STATUS.COMPLIANT,
    extractedValue: 'MRP ₹ 185.00 (Incl. of all taxes)',
    confidenceScore: 99.2,
    notes: 'Proper currency symbol and mandatory inclusive statement present.',
  },
  {
    ruleCode: 'RULE_6_1_F',
    ruleTitle: 'Rule 6(1)(f) - Consumer Care Cell',
    status: COMPLIANCE_STATUS.COMPLIANT,
    extractedValue: 'Toll Free: 1800-200-4567 | care@apexcare.in',
    confidenceScore: 97.5,
    notes: 'Both phone and electronic contact verified.',
  },
];

// ============================================================================
// 10. SCAN SESSION MOCK DATA (Phase 3)
// ============================================================================

export const mockScanSession = {
  scanId: 'SCN-MOCK-2026-001',
  createdAt: new Date().toISOString(),
  status: 'CREATED',
};

export const mockImageUploadResponse = {
  imageId: 'IMG-001',
  status: 'UPLOADED',
  qualityStatus: 'PENDING',
  message: 'Image received. Backend quality assessment pending.',
};

export const mockAnalysisStages = [
  { key: 'upload', label: 'Image Upload', status: 'COMPLETE' },
  { key: 'quality', label: 'Image Quality Assessment', status: 'COMPLETE' },
  { key: 'detection', label: 'Label Detection', status: 'COMPLETE' },
  { key: 'ocr', label: 'OCR Extraction', status: 'COMPLETE' },
  { key: 'compliance', label: 'Compliance Analysis', status: 'COMPLETE' },
];

export const mockAnalysisResult = {
  scanId: 'SCN-MOCK-2026-001',
  status: 'COMPLETE',
  message: 'Analysis complete. Navigate to Compliance Analysis for results.',
};

// ============================================================================
// 11. COMPLIANCE ANALYSIS MOCK DATA (Phase 4)
// ============================================================================

export const mockAnalysisSummary = {
  status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
  totalChecks: 12,
  passedChecks: 9,
  potentialFindings: 2,
  needsReview: 1,
};

export const mockExtractedData = [
  { field: 'Product Name', value: 'NutriCrunch Wheat Biscuits', confidence: 98 },
  { field: 'Brand', value: 'GoldenHarvest Foods', confidence: 96 },
  { field: 'MRP', value: '₹120.00', confidence: 95 },
  { field: 'Net Quantity', value: '500 g', confidence: 92 },
  { field: 'Manufacturer', value: 'ABC Industries Ltd.', confidence: 88 },
  { field: 'Address', value: '123 Industrial Area, Phase 2, New Delhi 110020', confidence: 85 },
  { field: 'Batch/Lot', value: 'LOT-2026-09-A', confidence: 91 },
  { field: 'Date of Mfg', value: '05/2026', confidence: 94 },
  { field: 'Consumer Care', value: '1800-200-4567 | care@goldenharvest.in', confidence: 89 },
];

export const mockComplianceChecks = [
  {
    id: 'CHK-001',
    name: 'Manufacturer Address',
    expected: 'Complete physical address required',
    extracted: '123 Industrial Area, Phase 2, New Delhi 110020',
    status: COMPLIANCE_STATUS.COMPLIANT,
    confidence: 85,
    explanation: 'Valid address format detected.',
    ruleReference: {
      ruleId: 'RULE_6_1_A',
      ruleName: 'Rule 6(1)(a)',
      description: 'Name and complete address of the manufacturer, packer, or importer'
    },
    evidenceAvailable: true
  },
  {
    id: 'CHK-002',
    name: 'Maximum Retail Price (MRP)',
    expected: 'Must include "MRP", "Rs" or "₹", and "inclusive of all taxes"',
    extracted: '₹120.00',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    confidence: 95,
    explanation: 'Missing declaration "inclusive of all taxes".',
    ruleReference: {
      ruleId: 'RULE_6_1_E',
      ruleName: 'Rule 6(1)(e)',
      description: 'Maximum Retail Price (MRP) inclusive of all taxes'
    },
    evidenceAvailable: true
  },
  {
    id: 'CHK-003',
    name: 'Net Quantity',
    expected: 'Standard unit of weight/measure',
    extracted: '500 g',
    status: COMPLIANCE_STATUS.COMPLIANT,
    confidence: 92,
    explanation: 'Standard metric unit (g) detected correctly.',
    ruleReference: {
      ruleId: 'RULE_6_1_C',
      ruleName: 'Rule 6(1)(c)',
      description: 'Net quantity in terms of standard unit of weight, measure or number'
    },
    evidenceAvailable: true
  },
  {
    id: 'CHK-004',
    name: 'Consumer Care Details',
    expected: 'Phone number and email/address required',
    extracted: '1800-200-4567',
    status: COMPLIANCE_STATUS.NEEDS_REVIEW,
    confidence: 78,
    explanation: 'Email address text is partially obscured or low confidence.',
    ruleReference: {
      ruleId: 'RULE_6_1_F',
      ruleName: 'Rule 6(1)(f)',
      description: 'Name, address, telephone number, email of the consumer care cell'
    },
    evidenceAvailable: true
  }
];

export const mockPotentialFindings = [
  {
    id: 'FND-001',
    category: 'MRP Declaration',
    field: 'MRP',
    description: 'The phrase "inclusive of all taxes" is missing next to the MRP.',
    confidence: 95,
    risk: RISK_LEVEL.HIGH_RISK,
    evidenceId: 'EVD-001',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION
  },
  {
    id: 'FND-002',
    category: 'Consumer Information',
    field: 'Consumer Care',
    description: 'Email address for consumer care is illegible or missing.',
    confidence: 78,
    risk: RISK_LEVEL.MEDIUM_RISK,
    evidenceId: 'EVD-002',
    status: COMPLIANCE_STATUS.NEEDS_REVIEW
  }
];

export const mockRiskAssessment = {
  score: 72,
  level: RISK_LEVEL.HIGH_RISK,
  factors: [
    'Critical mandatory declaration missing (MRP taxes)',
    'Incomplete consumer care contact info',
    'Historical non-compliance for this brand (2 prior flags)'
  ]
};

export const mockAnalysisImages = [
  { id: 'IMG-1', viewName: 'Front View', url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80', isPrimary: true },
  { id: 'IMG-2', viewName: 'Back View', url: 'https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?auto=format&fit=crop&w=800&q=80', isPrimary: false },
];

// ============================================================================
// 12. VIOLATION EVIDENCE MOCK DATA (Phase 5)
// ============================================================================

export const mockEvidenceData = {
  scanId: 'SCN-MOCK-2026-001',
  findingId: 'FND-001',
  product: {
    name: 'NutriCrunch Wheat Biscuits',
    brand: 'GoldenHarvest Foods',
  },
  finding: {
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    category: 'MRP Declaration',
    affectedField: 'MRP',
    extractedValue: '₹120.00',
    expectedValue: 'Must include "inclusive of all taxes"',
    confidence: 95,
    riskContribution: RISK_LEVEL.HIGH_RISK,
    description: 'The phrase "inclusive of all taxes" is missing next to the MRP. This is a mandatory declaration under the Legal Metrology (Packaged Commodities) Rules, 2011.',
  },
  evidence: {
    primaryImage: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80',
    boundingBoxes: [
      { id: 'bb-1', x: 20, y: 70, width: 25, height: 10, label: 'Detected MRP Area', type: 'finding' }
    ],
    supportingText: [
      { label: 'Raw OCR Output', text: 'NET WT 500g\nMRP ₹120.00\nMFG 05/2026' }
    ],
  },
  ruleReference: {
    id: 'RULE_6_1_E',
    title: 'Rule 6(1)(e)',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    referenceText: 'Every package shall bear thereon or on label the retail sale price of the package, indicating that it is the maximum retail price inclusive of all taxes.',
  },
  confidenceMetrics: {
    ocr: 96,
    extraction: 95,
    finding: 91,
  },
  risk: {
    score: 82,
    level: RISK_LEVEL.HIGH_RISK,
    factors: [
      'Missing mandatory tax inclusive declaration',
      'High severity legal requirement',
    ],
  },
  traceability: {
    scanId: 'SCN-MOCK-2026-001',
    findingId: 'FND-001',
    evidenceId: 'EVD-001',
    sourceImage: 'Front View (IMG-1)',
    analysisTimestamp: new Date().toISOString(),
    analysisVersion: 'v2.4.1 (Stable)',
    ruleEngineVersion: 'RE-2026.1',
  },
};

// ============================================================================
// 13. OFFICER VERIFICATION MOCK DATA (Phase 6)
// ============================================================================

export const mockVerificationData = {
  scanId: 'SCN-MOCK-2026-001',
  findingId: 'FND-001',
  status: REVIEW_STATUS.PENDING_OFFICER_REVIEW,
  product: {
    name: 'NutriCrunch Wheat Biscuits',
    brand: 'GoldenHarvest Foods',
  },
  finding: {
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    category: 'MRP Declaration',
    affectedField: 'MRP',
    extractedValue: '₹120.00',
    expectedValue: 'Must include "inclusive of all taxes"',
    confidence: 95,
    riskScore: 82,
    riskLevel: RISK_LEVEL.HIGH_RISK,
    riskFactors: [
      'Missing mandatory tax inclusive declaration',
      'High severity legal requirement',
    ],
    description: 'The phrase "inclusive of all taxes" is missing next to the MRP. This is a mandatory declaration under the Legal Metrology (Packaged Commodities) Rules, 2011.',
  },
  evidence: {
    primaryImage: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80',
    boundingBoxes: [
      { id: 'bb-1', x: 20, y: 70, width: 25, height: 10, label: 'Detected MRP Area', type: 'finding' }
    ],
  },
  ruleReference: {
    id: 'RULE_6_1_E',
    title: 'Rule 6(1)(e)',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    referenceText: 'Every package shall bear thereon or on label the retail sale price of the package, indicating that it is the maximum retail price inclusive of all taxes.',
  },
  timeline: [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'SYSTEM', action: 'Scan Created', status: 'SUCCESS' },
    { timestamp: new Date(Date.now() - 3590000).toISOString(), actor: 'SYSTEM', action: 'OCR Completed', status: 'SUCCESS' },
    { timestamp: new Date(Date.now() - 3585000).toISOString(), actor: 'AI_ANALYSIS', action: 'Potential Finding Identified', status: 'FLAGGED' },
    { timestamp: new Date(Date.now() - 3580000).toISOString(), actor: 'SYSTEM', action: 'Evidence Generated', status: 'SUCCESS' },
  ],
};

export const mockAlreadyReviewedData = {
  ...mockVerificationData,
  status: REVIEW_STATUS.COMPLETED,
  decision: OFFICER_DECISION.CONFIRM_FINDING,
  remarks: 'I have reviewed the image and the MRP does indeed omit the mandatory "inclusive of all taxes" statement. The violation is confirmed.',
  reviewedAt: new Date(Date.now() - 10000).toISOString(),
  reviewedBy: 'Officer J. Smith (ID: LMO-1049)',
  timeline: [
    ...mockVerificationData.timeline,
    { timestamp: new Date(Date.now() - 10000).toISOString(), actor: 'OFFICER', action: 'Review Submitted: Confirm Finding', status: 'COMPLETED' },
  ]
};

// ============================================================================
// 14. PRODUCT COMPLIANCE HISTORY MOCK DATA (Phase 7)
// ============================================================================

export const mockHistorySummary = {
  totalProducts: 1240,
  totalInspections: 3860,
  potentialFindings: 412,
  reviewedFindings: 351,
};

export const mockProductHistoryList = [
  {
    productId: 'PRODUCT-001',
    name: 'NutriCrunch Wheat Biscuits',
    brand: 'GoldenHarvest Foods',
    lastInspection: new Date(Date.now() - 3600000).toISOString(),
    inspectionCount: 4,
    currentStatus: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
    riskLevel: RISK_LEVEL.HIGH_RISK,
    openFindings: 1,
    lastOfficerDecision: OFFICER_DECISION.CONFIRM_FINDING
  },
  {
    productId: 'PRODUCT-002',
    name: 'AquaPure Mineral Water 1L',
    brand: 'AquaPure',
    lastInspection: new Date(Date.now() - 86400000).toISOString(),
    inspectionCount: 12,
    currentStatus: COMPLIANCE_STATUS.COMPLIANT,
    riskLevel: RISK_LEVEL.LOW_RISK,
    openFindings: 0,
    lastOfficerDecision: 'N/A'
  },
  {
    productId: 'PRODUCT-003',
    name: 'SpiceKing Turmeric Powder',
    brand: 'SpiceKing',
    lastInspection: new Date(Date.now() - 172800000).toISOString(),
    inspectionCount: 2,
    currentStatus: COMPLIANCE_STATUS.NEEDS_REVIEW,
    riskLevel: RISK_LEVEL.MEDIUM_RISK,
    openFindings: 2,
    lastOfficerDecision: OFFICER_DECISION.NEEDS_FURTHER_REVIEW
  }
];

export const mockProductDetail = {
  productId: 'PRODUCT-001',
  identity: {
    name: 'NutriCrunch Wheat Biscuits',
    brand: 'GoldenHarvest Foods',
    manufacturer: 'GoldenHarvest Foods Pvt Ltd',
    packer: 'GoldenHarvest Packaging Unit 3',
    importer: null,
    batchLot: 'BATCH-2026-A1',
    countryOfOrigin: 'India'
  },
  currentStatus: COMPLIANCE_STATUS.POTENTIAL_VIOLATION,
  summary: {
    totalInspections: 4,
    compliantInspections: 2,
    potentialFindings: 2,
    officerConfirmations: 1,
    officerInvalidations: 0,
    needsFurtherReview: 0
  },
  trend: [
    { inspectionId: 'INSP-01', status: COMPLIANCE_STATUS.COMPLIANT, date: new Date(Date.now() - 30 * 86400000).toISOString() },
    { inspectionId: 'INSP-02', status: COMPLIANCE_STATUS.COMPLIANT, date: new Date(Date.now() - 20 * 86400000).toISOString() },
    { inspectionId: 'INSP-03', status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION, date: new Date(Date.now() - 10 * 86400000).toISOString() },
    { inspectionId: 'INSP-04', status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION, date: new Date(Date.now() - 3600000).toISOString() }
  ]
};

export const mockInspectionTimeline = [
  { id: 'INSP-04', date: new Date(Date.now() - 3600000).toISOString(), status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION, findingCount: 1, riskLevel: RISK_LEVEL.HIGH_RISK },
  { id: 'INSP-03', date: new Date(Date.now() - 10 * 86400000).toISOString(), status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION, findingCount: 1, riskLevel: RISK_LEVEL.MEDIUM_RISK },
  { id: 'INSP-02', date: new Date(Date.now() - 20 * 86400000).toISOString(), status: COMPLIANCE_STATUS.COMPLIANT, findingCount: 0, riskLevel: RISK_LEVEL.LOW_RISK },
  { id: 'INSP-01', date: new Date(Date.now() - 30 * 86400000).toISOString(), status: COMPLIANCE_STATUS.COMPLIANT, findingCount: 0, riskLevel: RISK_LEVEL.LOW_RISK },
];

export const mockHistoricalFindings = [
  {
    id: 'FND-001',
    scanId: 'SCN-MOCK-2026-001',
    date: new Date(Date.now() - 3600000).toISOString(),
    category: 'MRP Declaration',
    affectedField: 'MRP',
    confidence: 95,
    riskLevel: RISK_LEVEL.HIGH_RISK,
    officerDecision: OFFICER_DECISION.CONFIRM_FINDING,
    hasEvidence: true
  },
  {
    id: 'FND-002',
    scanId: 'SCN-MOCK-2026-003',
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    category: 'Net Quantity',
    affectedField: 'Net Quantity',
    confidence: 88,
    riskLevel: RISK_LEVEL.MEDIUM_RISK,
    officerDecision: OFFICER_DECISION.INVALIDATE_FINDING,
    hasEvidence: true
  }
];

export const mockRecurringIssues = [
  {
    id: 'REC-01',
    pattern: 'Missing "inclusive of all taxes" declaration near MRP',
    occurrences: 2,
    lastDetected: new Date(Date.now() - 3600000).toISOString(),
    status: 'ACTIVE_PATTERN'
  }
];

export const mockHistoricalEvidence = [
  {
    id: 'EVD-001',
    scanId: 'SCN-MOCK-2026-001',
    findingId: 'FND-001',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=200&q=80',
    date: new Date(Date.now() - 3600000).toISOString(),
    category: 'MRP Declaration',
    status: COMPLIANCE_STATUS.POTENTIAL_VIOLATION
  }
];

// ============================================================================
// 15. REPORTS & ENFORCEMENT ANALYTICS MOCK DATA (Phase 8)
// ============================================================================

export const mockReportAnalytics = {
  reportingPeriod: {
    start: new Date(Date.now() - 30 * 86400000).toISOString(),
    end: new Date().toISOString()
  },
  summary: {
    totalInspections: 3860,
    productsInspected: 1240,
    potentialFindings: 412,
    officerReviews: 351,
    confirmedFindings: 198,
    invalidatedFindings: 103,
    needsFurtherReview: 50
  },
  inspectionActivity: [
    { date: '2026-08-22', count: 42 },
    { date: '2026-08-29', count: 56 },
    { date: '2026-09-05', count: 89 },
    { date: '2026-09-12', count: 124 },
    { date: '2026-09-19', count: 65 }
  ],
  complianceTrend: [
    { date: '2026-08-22', compliant: 30, potentialFindings: 10, needsReview: 2 },
    { date: '2026-08-29', compliant: 40, potentialFindings: 12, needsReview: 4 },
    { date: '2026-09-05', compliant: 65, potentialFindings: 20, needsReview: 4 },
    { date: '2026-09-12', compliant: 90, potentialFindings: 25, needsReview: 9 },
    { date: '2026-09-19', compliant: 45, potentialFindings: 15, needsReview: 5 }
  ],
  findingCategories: [
    { category: 'Missing Declaration', count: 120, percentage: 29 },
    { category: 'MRP Formatting', count: 95, percentage: 23 },
    { category: 'Net Quantity', count: 82, percentage: 20 },
    { category: 'Manufacturer Info', count: 65, percentage: 16 },
    { category: 'Other', count: 50, percentage: 12 }
  ],
  riskDistribution: [
    { level: RISK_LEVEL.LOW_RISK, count: 210 },
    { level: RISK_LEVEL.MEDIUM_RISK, count: 120 },
    { level: RISK_LEVEL.HIGH_RISK, count: 65 },
    { level: RISK_LEVEL.CRITICAL_RISK, count: 17 }
  ],
  recurringIssues: [
    {
      id: 'REC-01',
      pattern: 'Missing "inclusive of all taxes" declaration near MRP',
      occurrences: 45,
      affectedProducts: 32,
      lastDetected: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'REC-02',
      pattern: 'Net Quantity font size smaller than required minimum',
      occurrences: 28,
      affectedProducts: 15,
      lastDetected: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  officerReviewOutcomes: [
    { outcome: OFFICER_DECISION.CONFIRM_FINDING, count: 198 },
    { outcome: OFFICER_DECISION.INVALIDATE_FINDING, count: 103 },
    { outcome: OFFICER_DECISION.NEEDS_FURTHER_REVIEW, count: 50 },
    { outcome: 'PENDING_REVIEW', count: 61 }
  ]
};
