import fs from "fs";
import path from "path";
import { RoleType } from "@/lib/rbac";

export type ProcurementMethodKey =
  | "DIRECT_PURCHASE"
  | "RFQ"
  | "COMPETITIVE_QUOTATION"
  | "TENDER"
  | "FRAMEWORK_AGREEMENT"
  | "EMERGENCY_PROCUREMENT"
  | "SINGLE_SOURCE";

export interface TenantOrganization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  taxId: string;
  primaryColor: string;
  baseCurrency: string;
  documentHeader: string;
  documentFooter: string;
}

export interface BranchRecord {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  address: string;
  isHeadquarters: boolean;
}

export interface DepartmentRecord {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  headName: string;
  fiscalPeriod: string;
  currency: string;
  totalBudget: number;
  encumbered: number; // Approved PRs
  committed: number; // Open POs
  actualSpend: number; // Paid Invoices
  warningThresholdPct: number;
  criticalThresholdPct: number;
}

export interface CostCenterRecord {
  id: string;
  organizationId: string;
  departmentId: string;
  departmentName: string;
  code: string;
  name: string;
}

export interface UserRecord {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  departmentName: string;
  role: RoleType;
  isActive: boolean;
  delegatedToUserId?: string;
  delegationReason?: string;
  delegationEnd?: string;
}

export interface CurrencyRecord {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBase: boolean;
}

export interface TaxRateRecord {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  percentage: number;
  isActive: boolean;
}

export interface CatalogItemRecord {
  id: string;
  organizationId: string;
  sku: string;
  name: string;
  category: string;
  specification: string;
  unitOfMeasure: string;
  referenceUnitCost: number;
  currency: string;
  defaultMethod: ProcurementMethodKey;
}

export interface ApprovalStepConfig {
  stepOrder: number;
  stepName: string;
  approverRole: RoleType;
  minThresholdAmount: number;
  slaHours: number;
}

export interface ApprovalWorkflowRecord {
  id: string;
  organizationId: string;
  name: string;
  targetDocument:
    | "PURCHASE_REQUISITION"
    | "PURCHASE_ORDER"
    | "INVOICE"
    | "CONTRACT"
    | "PROCUREMENT_PLAN";
  isActive: boolean;
  steps: ApprovalStepConfig[];
}

export interface ApprovalHistoryComment {
  stepOrder: number;
  stepName: string;
  actorName: string;
  actorRole: RoleType;
  delegatedFrom?: string;
  decision: "APPROVED" | "REJECTED" | "PENDING";
  comment: string;
  timestamp: string;
}

export interface PendingApprovalSample {
  id: string;
  organizationId: string;
  referenceNo: string;
  documentType:
    | "PURCHASE_REQUISITION"
    | "PURCHASE_ORDER"
    | "INVOICE"
    | "CONTRACT";
  title: string;
  departmentName: string;
  amount: number;
  currency: string;
  currentStepOrder: number;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  history: ApprovalHistoryComment[];
}

// -----------------------------------------------------------------------------
// PHASE 2 INTERFACES (MODULES 1, 3, 5, 9)
// -----------------------------------------------------------------------------

export interface ProcurementMethodRecord {
  id: string;
  organizationId: string;
  method: ProcurementMethodKey;
  displayName: string;
  description: string;
  minQuotesRequired: number;
  maxAmountCeiling: number | null;
  requiresMandatoryJustification: boolean;
  requiredDocuments: string[];
  workflowStages: string[];
}

export interface ProcurementPlanRecord {
  id: string;
  organizationId: string;
  planCode: string;
  fiscalPeriod: string;
  departmentId: string;
  departmentName: string;
  category: string;
  description: string;
  estimatedBudget: number;
  currency: string;
  expectedQuarter: "Q1" | "Q2" | "Q3" | "Q4";
  expectedDate: string;
  plannedMethod: ProcurementMethodKey;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  approvedBy?: string;
  approvedAt?: string;
}

export interface PurchaseRequisitionLineItem {
  id: string;
  sku: string;
  description: string;
  specification: string;
  quantity: number;
  unitOfMeasure: string;
  estimatedUnitCost: number;
  totalEstimatedCost: number;
}

export interface PurchaseRequisitionRecord {
  id: string;
  organizationId: string;
  prNumber: string;
  title: string;
  requesterName: string;
  requesterRole: RoleType;
  departmentId: string;
  departmentName: string;
  costCenterId: string;
  costCenterCode: string;
  costCenterName: string;
  procurementPlanId?: string;
  procurementPlanCode?: string;
  plannedMethod?: ProcurementMethodKey;
  selectedMethod: ProcurementMethodKey;
  methodDeviationJustification?: string;
  currency: string;
  totalAmount: number;
  requiredDate: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  revisionNumber: number;
  budgetEncumbered: boolean;
  createdAt: string;
  items: PurchaseRequisitionLineItem[];
  approvalTimeline: ApprovalHistoryComment[];
}

// -----------------------------------------------------------------------------
// PHASE 3 INTERFACES (MODULES 6, 7, 8, 10)
// -----------------------------------------------------------------------------

export interface SupplierVaultDocument {
  id: string;
  docType: string;
  fileName: string;
  expiryDate: string;
  status: "VALID" | "EXPIRING_SOON" | "EXPIRED";
}

export interface SupplierRecord {
  id: string;
  organizationId: string;
  supplierCode: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
  bankName: string;
  bankAccountNo: string;
  approvalStatus: "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";
  isPreferred: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  deliveryTimeScore: number; // 0-100
  qualityRating: number; // 0-5.0
  priceCompetitivenessScore: number; // 0-100
  cumulativeSpend: number;
  completedPoCount: number;
  documents: SupplierVaultDocument[];
}

export interface RfqClarificationRecord {
  id: string;
  supplierName: string;
  question: string;
  response?: string;
  askedAt: string;
  respondedAt?: string;
}

export interface SupplierQuotationRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  quotedAmount: number;
  currency: string;
  leadTimeDays: number;
  validityDays: number;
  warrantyAndSpecsNote: string;
  isSelected: boolean;
  submittedAt: string;
}

export interface RfqRecord {
  id: string;
  organizationId: string;
  rfqNumber: string;
  prId: string;
  prNumber: string;
  title: string;
  departmentName: string;
  procurementMethod: ProcurementMethodKey;
  estimatedBudget: number;
  currency: string;
  submissionDeadline: string;
  status: "DRAFT" | "ISSUED" | "CLOSED" | "EVALUATED";
  invitedSupplierIds: string[];
  quotations: SupplierQuotationRecord[];
  clarifications: RfqClarificationRecord[];
  selectedSupplierId?: string;
  selectedSupplierName?: string;
  awardedAmount?: number;
  selectionJustification?: string;
  cheapestOverrideReason?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
}

export interface ContractAmendmentRecord {
  id: string;
  versionNumber: number;
  amendmentSummary: string;
  previousCeiling: number;
  newCeiling: number;
  newEndDate: string;
  amendedBy: string;
  amendedAt: string;
}

export interface SupplierContractRecord {
  id: string;
  organizationId: string;
  contractNumber: string;
  title: string;
  supplierId: string;
  supplierName: string;
  departmentId: string;
  departmentName: string;
  ownerName: string;
  procurementMethod: ProcurementMethodKey;
  startDate: string;
  endDate: string;
  renewalReminderDays: 90 | 60 | 30;
  ceilingValue: number;
  utilizedSpend: number;
  linkedPoNumbers: string[];
  currency: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRING" | "EXPIRED" | "TERMINATED";
  versionNumber: number;
  documentFileName: string;
  amendments: ContractAmendmentRecord[];
}

// -----------------------------------------------------------------------------
// PHASE 4 INTERFACES (MODULES 11, 12, 13)
// -----------------------------------------------------------------------------

export interface PurchaseOrderLineItem {
  id: string;
  sku: string;
  description: string;
  unitOfMeasure: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrderAmendmentRecord {
  id: string;
  versionNumber: number;
  amendmentNote: string;
  previousAmount: number;
  newAmount: number;
  amendedBy: string;
  amendedAt: string;
}

export interface PurchaseOrderRecord {
  id: string;
  organizationId: string;
  poNumber: string;
  title: string;
  supplierId: string;
  supplierName: string;
  departmentId: string;
  departmentName: string;
  prId?: string;
  prNumber?: string;
  rfqId?: string;
  rfqNumber?: string;
  contractId?: string;
  contractNumber?: string;
  currency: string;
  totalAmount: number;
  expectedDeliveryDate: string;
  confirmedDeliveryDate?: string;
  supplierAckNote?: string;
  status:
    | "DRAFT"
    | "ISSUED"
    | "ACKNOWLEDGED"
    | "PARTIALLY_DELIVERED"
    | "COMPLETED"
    | "CANCELLED";
  versionNumber: number;
  allowSplitDelivery: boolean;
  emailedToSupplierAt?: string;
  createdAt: string;
  items: PurchaseOrderLineItem[];
  amendments: PurchaseOrderAmendmentRecord[];
}

export interface GrnLineItemRecord {
  id: string;
  sku: string;
  description: string;
  unitOfMeasure: string;
  orderedQty: number;
  receivedQtyThisGrn: number;
  damagedOrShortQty: number;
  conditionFlag: "GOOD" | "SHORTAGE" | "DAMAGED" | "SUBSTITUTED";
  discrepancyNote?: string;
}

export interface GoodsReceiptNoteRecord {
  id: string;
  organizationId: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  departmentName: string;
  receivedBy: string;
  deliveryNoteRef: string;
  receivedAt: string;
  status: "PENDING" | "PARTIALLY_RECEIVED" | "FULLY_RECEIVED";
  hasDiscrepancy: boolean;
  items: GrnLineItemRecord[];
}

// -----------------------------------------------------------------------------
// PHASE 5 INTERFACES (MODULES 14, 15)
// -----------------------------------------------------------------------------

export interface PurchaseReturnRecord {
  id: string;
  organizationId: string;
  returnNumber: string;
  grnId: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  departmentId: string;
  departmentName: string;
  sku: string;
  description: string;
  unitOfMeasure: string;
  returnedQty: number;
  unitPrice: number;
  returnAmount: number;
  reasonCode:
    | "DAMAGED"
    | "WRONG_SPECIFICATION"
    | "EXPIRED_SHORT_DATED"
    | "QUALITY_DEFECT";
  reasonNotes: string;
  resolutionType: "REPLACEMENT_DELIVERY" | "CREDIT_NOTE_ADJUSTMENT";
  creditNoteNumber?: string;
  status:
    | "RAISED"
    | "APPROVED"
    | "DISPATCHED_TO_SUPPLIER"
    | "SUPPLIER_ACKNOWLEDGED"
    | "RESOLVED";
  budgetReleased: boolean;
  raisedBy: string;
  createdAt: string;
}

export interface InvoicePaymentEntry {
  id: string;
  paymentReference: string;
  paymentMethod: "EFT_RTGS" | "SWIFT_WIRE" | "MPESA_B2B" | "CHEQUE";
  amountPaid: number;
  paidBy: string;
  paidAt: string;
}

export interface SupplierInvoiceRecord {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  internalVoucherNo: string;
  poId: string;
  poNumber: string;
  grnId: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  departmentId: string;
  departmentName: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  sku: string;
  description: string;
  unitOfMeasure: string;
  invoicedQty: number;
  invoicedUnitPrice: number;
  poOrderedQty: number;
  poUnitPrice: number;
  grnAcceptedQty: number;
  subtotalAmount: number;
  taxAmount: number;
  creditNoteDeduction: number;
  netPayableAmount: number;
  amountPaid: number;
  balanceDue: number;
  threeWayMatchStatus:
    | "MATCHED"
    | "QUANTITY_MISMATCH"
    | "PRICE_MISMATCH"
    | "BOTH_MISMATCH";
  exceptionResolutionNote?: string;
  exceptionResolvedBy?: string;
  status:
    | "PENDING_MATCH"
    | "EXCEPTION_FLAGGED"
    | "APPROVED_FOR_PAYMENT"
    | "SCHEDULED"
    | "PARTIALLY_PAID"
    | "PAID"
    | "REJECTED";
  scheduledPaymentDate?: string;
  financeSignedOffBy?: string;
  createdAt: string;
  payments: InvoicePaymentEntry[];
}

// -----------------------------------------------------------------------------
// PHASE 6 INTERFACES (MODULES 16, 17, 18, 19)
// -----------------------------------------------------------------------------

export type BrandedDocumentType =
  | "PURCHASE_REQUISITION"
  | "REQUEST_FOR_QUOTATION"
  | "QUOTATION_EVALUATION_REPORT"
  | "AWARD_LETTER"
  | "PURCHASE_ORDER"
  | "GOODS_RECEIPT_NOTE"
  | "PURCHASE_RETURN_NOTE"
  | "SUPPLIER_EVALUATION_REPORT"
  | "PROCUREMENT_EXECUTIVE_REPORT";

export interface DocumentTemplateRecord {
  id: string;
  organizationId: string;
  templateCode: string;
  docType: BrandedDocumentType;
  title: string;
  versionNumber: number;
  includeLogo: boolean;
  includeSignatureBlocks: boolean;
  includeTermsAndConditions: boolean;
  customFooterText: string;
  updatedBy: string;
  updatedAt: string;
}

export type ProcurementAlertCategory =
  | "PENDING_APPROVAL_ESCALATION"
  | "OVERDUE_PO_DELIVERY"
  | "BUDGET_THRESHOLD_WARNING"
  | "RFQ_DEADLINE_CLOSING_48H"
  | "CONTRACT_RENEWAL_REMINDER"
  | "EXPIRING_SUPPLIER_CERTIFICATE"
  | "INVOICE_3WAY_MISMATCH"
  | "PURCHASE_RETURN_UPDATE"
  | "NEW_SUPPLIER_QUOTE";

export interface ProcurementAlertRecord {
  id: string;
  organizationId: string;
  alertType: ProcurementAlertCategory;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  referenceNo: string;
  targetHref: string;
  channels: string;
  status: "ACTIVE" | "ACKNOWLEDGED";
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  actorName: string;
  actorRole: RoleType;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  ipAddress: string;
  timestamp: string;
}

// -----------------------------------------------------------------------------
// PHASE 7 INTERFACES (MODULE 21: ENTERPRISE INTEGRATIONS & LAUNCH READINESS)
// -----------------------------------------------------------------------------

export type EnterpriseIntegrationCategory =
  | "ACCOUNTING"
  | "ERP_INVENTORY"
  | "SSO_IDENTITY"
  | "CLOUD_STORAGE"
  | "COMMUNICATION_ALERTS";

export interface EnterpriseIntegrationRecord {
  id: string;
  organizationId: string;
  connectorKey: string;
  providerName: string;
  category: EnterpriseIntegrationCategory;
  description: string;
  status: "CONNECTED" | "DISCONNECTED" | "SANDBOX_ACTIVE";
  endpointOrAccountRef: string;
  syncDirection: string;
  autoSyncInvoices: boolean;
  lastSyncedAt: string;
  totalSyncedRecords: number;
}

export interface IntegrationSyncLogRecord {
  id: string;
  organizationId: string;
  connectorKey: string;
  providerName: string;
  eventType: string;
  referenceNo: string;
  payloadSummary: string;
  status: "SUCCESS" | "QUEUED" | "WARNING";
  syncedBy: string;
  timestamp: string;
}

export interface Phase1DatabaseState {
  activeOrganizationId: string;
  activeUserId: string;
  activePortalSupplierId: string;
  organizations: TenantOrganization[];
  branches: BranchRecord[];
  departments: DepartmentRecord[];
  costCenters: CostCenterRecord[];
  users: UserRecord[];
  currencies: CurrencyRecord[];
  taxRates: TaxRateRecord[];
  catalogItems: CatalogItemRecord[];
  approvalWorkflows: ApprovalWorkflowRecord[];
  approvalQueue: PendingApprovalSample[];
  procurementMethods: ProcurementMethodRecord[];
  procurementPlans: ProcurementPlanRecord[];
  purchaseRequisitions: PurchaseRequisitionRecord[];
  suppliers: SupplierRecord[];
  rfqs: RfqRecord[];
  contracts: SupplierContractRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  goodsReceipts: GoodsReceiptNoteRecord[];
  purchaseReturns: PurchaseReturnRecord[];
  supplierInvoices: SupplierInvoiceRecord[];
  documentTemplates: DocumentTemplateRecord[];
  procurementAlerts: ProcurementAlertRecord[];
  enterpriseIntegrations: EnterpriseIntegrationRecord[];
  integrationSyncLogs: IntegrationSyncLogRecord[];
  auditLogs: AuditLogEntry[];
}

const DB_FILE_PATH = path.join(process.cwd(), ".vensure-local-db.json");

function createDefaultProcurementMethods(): ProcurementMethodRecord[] {
  return [
    {
      id: "pm_direct",
      organizationId: "org_horizon",
      method: "DIRECT_PURCHASE",
      displayName: "Direct Purchase",
      description: "Low-value routine purchase; no competitive quotation required (Up to KES 150,000).",
      minQuotesRequired: 1,
      maxAmountCeiling: 150000,
      requiresMandatoryJustification: false,
      requiredDocuments: ["Purchase Requisition", "Purchase Order", "GRN", "Tax Invoice"],
      workflowStages: ["PR Approved", "Direct PO Issue", "GRN", "Invoice & Payment"],
    },
    {
      id: "pm_rfq",
      organizationId: "org_horizon",
      method: "RFQ",
      displayName: "Request for Quotation (RFQ)",
      description: "Standard request for quotation issued to registered suppliers (Up to KES 3,000,000).",
      minQuotesRequired: 2,
      maxAmountCeiling: 3000000,
      requiresMandatoryJustification: false,
      requiredDocuments: [
        "Purchase Requisition",
        "RFQ Document",
        "Supplier Quotations",
        "Quotation Evaluation Report",
        "Purchase Order",
        "GRN",
        "Tax Invoice",
      ],
      workflowStages: ["PR Approved", "RFQ Issued", "Quotes Evaluated", "PO Issued", "GRN", "3-Way Match"],
    },
    {
      id: "pm_comp",
      organizationId: "org_horizon",
      method: "COMPETITIVE_QUOTATION",
      displayName: "Competitive Quotation (Min 3 Quotes)",
      description: "Mandatory minimum of 3 independent supplier quotations evaluated side-by-side (Up to KES 10,000,000).",
      minQuotesRequired: 3,
      maxAmountCeiling: 10000000,
      requiresMandatoryJustification: false,
      requiredDocuments: [
        "Purchase Requisition",
        "RFQ Invite (3+ Suppliers)",
        "Minimum 3 Sealed/Portal Quotes",
        "Weighted Evaluation Matrix",
        "Award Letter",
        "Purchase Order",
        "GRN",
      ],
      workflowStages: ["PR Approved", "3+ Supplier RFQ", "Weighted Evaluation", "Award Letter", "PO Issued", "3-Way Match"],
    },
    {
      id: "pm_tender",
      organizationId: "org_horizon",
      method: "TENDER",
      displayName: "Public / Selective Tender",
      description: "Full formal tender process for high-value capital or multi-year supplies.",
      minQuotesRequired: 3,
      maxAmountCeiling: null,
      requiresMandatoryJustification: false,
      requiredDocuments: [
        "Approved Annual Plan Entry",
        "Purchase Requisition",
        "Tender Dossier & Specs",
        "Technical & Financial Bid Opening Report",
        "Tender Committee Award Letter",
        "Signed Contract",
        "Purchase Order",
      ],
      workflowStages: ["Plan Verified", "PR Approved", "Tender Notice", "Bid Evaluation", "Contract Signed", "PO Call-Off"],
    },
    {
      id: "pm_framework",
      organizationId: "org_horizon",
      method: "FRAMEWORK_AGREEMENT",
      displayName: "Framework Agreement Call-Off",
      description: "Direct call-off order against a pre-competed active supplier framework contract.",
      minQuotesRequired: 1,
      maxAmountCeiling: null,
      requiresMandatoryJustification: false,
      requiredDocuments: [
        "Active Framework Contract Reference",
        "Purchase Requisition",
        "Call-Off Purchase Order",
        "GRN",
        "Tax Invoice",
      ],
      workflowStages: ["PR Linked to Contract", "PR Approved", "Call-Off PO", "GRN", "3-Way Match"],
    },
    {
      id: "pm_emergency",
      organizationId: "org_horizon",
      method: "EMERGENCY_PROCUREMENT",
      displayName: "Emergency Procurement",
      description: "Fast-tracked life/safety or critical operational continuity purchase with mandatory justification.",
      minQuotesRequired: 1,
      maxAmountCeiling: 3500000,
      requiresMandatoryJustification: true,
      requiredDocuments: [
        "Mandatory Emergency Justification Note",
        "Executive Approver Sign-Off",
        "Purchase Order",
        "Post-Hoc Quotation / Market Check",
        "GRN & Invoice",
      ],
      workflowStages: ["Emergency Justification", "Fast-Track Executive Approval", "Immediate PO", "Post-Hoc Audit Pack"],
    },
    {
      id: "pm_single",
      organizationId: "org_horizon",
      method: "SINGLE_SOURCE",
      displayName: "Single-Source Procurement",
      description: "Proprietary OEM or sole authorized distributor; mandatory audit justification required.",
      minQuotesRequired: 1,
      maxAmountCeiling: null,
      requiresMandatoryJustification: true,
      requiredDocuments: [
        "Mandatory Single-Source Justification Note",
        "OEM / Sole Dealership Certificate",
        "Negotiated Quotation",
        "CFO / MD Override Approval",
        "Purchase Order",
      ],
      workflowStages: ["Single-Source Justification", "Executive Override Approval", "Direct RFQ", "PO Issued", "3-Way Match"],
    },
  ];
}

function createDefaultProcurementPlans(): ProcurementPlanRecord[] {
  return [
    {
      id: "plan_1",
      organizationId: "org_horizon",
      planCode: "PLAN-2026-001",
      fiscalPeriod: "FY2026",
      departmentId: "dept_lab",
      departmentName: "Pathology & Laboratory Sciences",
      category: "Laboratory Reagents",
      description: "Annual Hematology & Molecular PCR Diagnostic Reagent Supply",
      estimatedBudget: 5850000,
      currency: "KES",
      expectedQuarter: "Q4",
      expectedDate: "2026-10-15",
      plannedMethod: "FRAMEWORK_AGREEMENT",
      status: "ACTIVE",
      approvedBy: "Evelyn Chebet (MD / CEO)",
      approvedAt: "2026-01-12",
    },
    {
      id: "plan_2",
      organizationId: "org_horizon",
      planCode: "PLAN-2026-002",
      fiscalPeriod: "FY2026",
      departmentId: "dept_it",
      departmentName: "Digital Health & IT Infrastructure",
      category: "IT Hardware",
      description: "Ward 4 & Outpatient EMR Clinical Workstations & Tablets Rollout",
      estimatedBudget: 4550000,
      currency: "KES",
      expectedQuarter: "Q4",
      expectedDate: "2026-10-25",
      plannedMethod: "COMPETITIVE_QUOTATION",
      status: "ACTIVE",
      approvedBy: "Evelyn Chebet (MD / CEO)",
      approvedAt: "2026-01-14",
    },
    {
      id: "plan_3",
      organizationId: "org_horizon",
      planCode: "PLAN-2026-003",
      fiscalPeriod: "FY2026",
      departmentId: "dept_ops",
      departmentName: "Operations & Clinical Facilities",
      category: "Clinical Consumables",
      description: "Q4 Surgical Theatre Sterile Consumables & N95 PPE Stockpile",
      estimatedBudget: 2340000,
      currency: "KES",
      expectedQuarter: "Q4",
      expectedDate: "2026-11-01",
      plannedMethod: "RFQ",
      status: "ACTIVE",
      approvedBy: "Dr. Amina Odhiambo",
      approvedAt: "2026-09-20",
    },
    {
      id: "plan_4",
      organizationId: "org_horizon",
      planCode: "PLAN-2026-004",
      fiscalPeriod: "FY2026",
      departmentId: "dept_ops",
      departmentName: "Operations & Clinical Facilities",
      category: "Medical Equipment",
      description: "ICU Backup Portable Ventilator & Patient Monitoring Units (3x)",
      estimatedBudget: 3120000,
      currency: "KES",
      expectedQuarter: "Q4",
      expectedDate: "2026-11-15",
      plannedMethod: "TENDER",
      status: "PLANNED",
    },
  ];
}

function createDefaultPurchaseRequisitions(): PurchaseRequisitionRecord[] {
  return [
    {
      id: "pr_1",
      organizationId: "org_horizon",
      prNumber: "PR-2026-0040",
      title: "Q4 Surgical Theatre N95 Respirators & Sterile Packs",
      requesterName: "Dr. Amina Odhiambo",
      requesterRole: "DEPARTMENT_HEAD",
      departmentId: "dept_ops",
      departmentName: "Operations & Clinical Facilities",
      costCenterId: "cc_101",
      costCenterCode: "CC-1010",
      costCenterName: "ICU & Theatre Consumables",
      procurementPlanId: "plan_3",
      procurementPlanCode: "PLAN-2026-003",
      plannedMethod: "RFQ",
      selectedMethod: "RFQ",
      currency: "KES",
      totalAmount: 845000,
      requiredDate: "2026-10-20",
      status: "APPROVED",
      revisionNumber: 1,
      budgetEncumbered: true,
      createdAt: "2026-10-01 10:15:00",
      items: [
        {
          id: "pri_1",
          sku: "OPS-PPE-N95",
          description: "Surgical N95 Particulate Respirator Masks (Box of 50)",
          specification: "NIOSH Approved, Fluid Resistant, Individually Sealed",
          quantity: 100,
          unitOfMeasure: "BOX",
          estimatedUnitCost: 8450,
          totalEstimatedCost: 845000,
        },
      ],
      approvalTimeline: [
        {
          stepOrder: 1,
          stepName: "Level 1: Department Head (HOD) Endorsement",
          actorName: "Dr. Amina Odhiambo",
          actorRole: "DEPARTMENT_HEAD",
          decision: "APPROVED",
          comment: "Matches Q4 surgical schedule.",
          timestamp: "2026-10-01 11:00:00",
        },
        {
          stepOrder: 2,
          stepName: "Level 2: Procurement Officer Method & Spec Check",
          actorName: "Mercy Njoroge",
          actorRole: "PROCUREMENT_OFFICER",
          decision: "APPROVED",
          comment: "RFQ method verified against PLAN-2026-003.",
          timestamp: "2026-10-01 14:10:00",
        },
        {
          stepOrder: 3,
          stepName: "Level 3: Finance / CFO Budget Encumbrance Sign-Off (> KES 500,000)",
          actorName: "CPA Victor Mutua",
          actorRole: "FINANCE",
          decision: "APPROVED",
          comment: "Budget encumbered (KES 845,000) under Operations & Clinical Facilities.",
          timestamp: "2026-10-01 16:45:00",
        },
      ],
    },
    {
      id: "pr_2",
      organizationId: "org_horizon",
      prNumber: "PR-2026-0041",
      title: "Q4 Molecular Diagnostics PCR Reagent Replenishment (12 Kits)",
      requesterName: "Dr. Kenneth Mwangi",
      requesterRole: "DEPARTMENT_HEAD",
      departmentId: "dept_lab",
      departmentName: "Pathology & Laboratory Sciences",
      costCenterId: "cc_102",
      costCenterCode: "CC-2040",
      costCenterName: "Molecular Diagnostics Reagents",
      procurementPlanId: "plan_1",
      procurementPlanCode: "PLAN-2026-001",
      plannedMethod: "FRAMEWORK_AGREEMENT",
      selectedMethod: "FRAMEWORK_AGREEMENT",
      currency: "KES",
      totalAmount: 1326000,
      requiredDate: "2026-10-18",
      status: "UNDER_REVIEW",
      revisionNumber: 1,
      budgetEncumbered: false,
      createdAt: "2026-10-04 08:50:00",
      items: [
        {
          id: "pri_2",
          sku: "MED-hema-500",
          description: "Automated 5-Part Hematology Analyzer Reagent Kit",
          specification: "ISO 13485 certified, 500-test pack, 12-month minimum shelf life",
          quantity: 12,
          unitOfMeasure: "KIT",
          estimatedUnitCost: 110500,
          totalEstimatedCost: 1326000,
        },
      ],
      approvalTimeline: [
        {
          stepOrder: 1,
          stepName: "Level 1: Department Head (HOD) Endorsement",
          actorName: "Dr. Amina Odhiambo",
          actorRole: "DEPARTMENT_HEAD",
          decision: "APPROVED",
          comment: "Urgent Q4 clinical stock requirement verified against annual plan.",
          timestamp: "2026-10-04 09:15:00",
        },
        {
          stepOrder: 2,
          stepName: "Level 2: Procurement Officer Method & Spec Check",
          actorName: "Mercy Njoroge",
          actorRole: "PROCUREMENT_OFFICER",
          decision: "APPROVED",
          comment: "Catalog specs verified. Linked to Framework Agreement FA-2026-08.",
          timestamp: "2026-10-04 11:40:00",
        },
        {
          stepOrder: 3,
          stepName: "Level 3: Finance / CFO Budget Encumbrance Sign-Off (> KES 500,000)",
          actorName: "Awaiting FINANCE / Delegated Cover",
          actorRole: "FINANCE",
          decision: "PENDING",
          comment: "Awaiting > KES 500,000 threshold sign-off to encumber KES 1,326,000.",
          timestamp: "2026-10-04 11:41:00",
        },
      ],
    },
    {
      id: "pr_3",
      organizationId: "org_horizon",
      prNumber: "PR-2026-0042",
      title: "20x Enterprise Clinical Workstation Laptops for Ward 4",
      requesterName: "Grace Wanjiku",
      requesterRole: "DEPARTMENT_HEAD",
      departmentId: "dept_it",
      departmentName: "Digital Health & IT Infrastructure",
      costCenterId: "cc_103",
      costCenterCode: "CC-3010",
      costCenterName: "Cloud & Network Hardware",
      procurementPlanId: "plan_2",
      procurementPlanCode: "PLAN-2026-002",
      plannedMethod: "COMPETITIVE_QUOTATION",
      selectedMethod: "COMPETITIVE_QUOTATION",
      currency: "KES",
      totalAmount: 3770000,
      requiredDate: "2026-10-28",
      status: "REJECTED",
      rejectionReason:
        "Please reduce quantity from 20 to 15 units to stay within Q4 IT hardware cashflow allocation, then resubmit.",
      revisionNumber: 1,
      budgetEncumbered: false,
      createdAt: "2026-10-04 14:00:00",
      items: [
        {
          id: "pri_3",
          sku: "IT-LTP-14P",
          description: "Enterprise Clinical Workstation Laptop 14-inch",
          specification: "32GB RAM, 1TB NVMe SSD, 3-Year Next-Business-Day Onsite Warranty",
          quantity: 20,
          unitOfMeasure: "EA",
          estimatedUnitCost: 188500,
          totalEstimatedCost: 3770000,
        },
      ],
      approvalTimeline: [
        {
          stepOrder: 1,
          stepName: "Level 1: Department Head (HOD) Endorsement",
          actorName: "Grace Wanjiku",
          actorRole: "DEPARTMENT_HEAD",
          decision: "APPROVED",
          comment: "Endorsed for Ward 4 EMR launch.",
          timestamp: "2026-10-04 14:15:00",
        },
        {
          stepOrder: 2,
          stepName: "Level 2: Procurement Officer Method & Spec Check",
          actorName: "Mercy Njoroge",
          actorRole: "PROCUREMENT_OFFICER",
          decision: "REJECTED",
          comment:
            "Please reduce quantity from 20 to 15 units to stay within Q4 IT hardware cashflow allocation, then resubmit.",
          timestamp: "2026-10-04 15:10:00",
        },
      ],
    },
  ];
}

function createInitialSeedState(): Phase1DatabaseState {
  return {
    activeOrganizationId: "org_horizon",
    activeUserId: "usr_admin_1",
    activePortalSupplierId: "sup_1",
    organizations: [
      {
        id: "org_horizon",
        name: "Horizon Medical & Diagnostics Group",
        slug: "horizon-medical",
        industry: "Healthcare & Hospitals",
        taxId: "PIN-P051492819K",
        primaryColor: "#10b981",
        baseCurrency: "KES",
        documentHeader:
          "Horizon Medical & Diagnostics Group • ISO 9001 Certified Procurement Division",
        documentFooter:
          "All Purchase Orders subject to Vensure 3-Way Match & Standard Terms v2026.1",
      },
      {
        id: "org_crestline",
        name: "Crestline Civil & Construction Ltd",
        slug: "crestline-civil",
        industry: "Construction & Infrastructure",
        taxId: "PIN-P099381722M",
        primaryColor: "#2563eb",
        baseCurrency: "KES",
        documentHeader:
          "Crestline Civil & Construction • Central Plant & Materials Procurement",
        documentFooter:
          "Deliveries require signed Warehouse GRN before Invoice submission.",
      },
    ],
    branches: [
      {
        id: "br_1",
        organizationId: "org_horizon",
        code: "HQ-NBO",
        name: "Nairobi Central Teaching Hospital (HQ)",
        address: "Hospital Hill Road, Upper Hill, Nairobi",
        isHeadquarters: true,
      },
      {
        id: "br_2",
        organizationId: "org_horizon",
        code: "BR-MBA",
        name: "Mombasa Coastal Diagnostics Center",
        address: "Links Road, Nyali, Mombasa",
        isHeadquarters: false,
      },
      {
        id: "br_3",
        organizationId: "org_crestline",
        code: "HQ-YARD",
        name: "Industrial Area Central Yard & HQ",
        address: "Enterprise Road, Plot 44, Nairobi",
        isHeadquarters: true,
      },
    ],
    departments: [
      {
        id: "dept_ops",
        organizationId: "org_horizon",
        code: "DEPT-OPS",
        name: "Operations & Clinical Facilities",
        headName: "Dr. Amina Odhiambo",
        fiscalPeriod: "FY2026",
        currency: "KES",
        totalBudget: 13000000,
        encumbered: 2600000,
        committed: 4550000,
        actualSpend: 3250000,
        warningThresholdPct: 70,
        criticalThresholdPct: 90,
      },
      {
        id: "dept_lab",
        organizationId: "org_horizon",
        code: "DEPT-LAB",
        name: "Pathology & Laboratory Sciences",
        headName: "Dr. Kenneth Mwangi",
        fiscalPeriod: "FY2026",
        currency: "KES",
        totalBudget: 23400000,
        encumbered: 3900000,
        committed: 8060000,
        actualSpend: 6240000,
        warningThresholdPct: 70,
        criticalThresholdPct: 90,
      },
      {
        id: "dept_it",
        organizationId: "org_horizon",
        code: "DEPT-IT",
        name: "Digital Health & IT Infrastructure",
        headName: "Grace Wanjiku",
        fiscalPeriod: "FY2026",
        currency: "KES",
        totalBudget: 9750000,
        encumbered: 1560000,
        committed: 2340000,
        actualSpend: 1950000,
        warningThresholdPct: 70,
        criticalThresholdPct: 90,
      },
      {
        id: "dept_civil",
        organizationId: "org_crestline",
        code: "DEPT-CIV",
        name: "Heavy Plant & Structural Works",
        headName: "Eng. David Kamau",
        fiscalPeriod: "FY2026",
        currency: "KES",
        totalBudget: 58500000,
        encumbered: 11050000,
        committed: 24700000,
        actualSpend: 14300000,
        warningThresholdPct: 70,
        criticalThresholdPct: 90,
      },
    ],
    costCenters: [
      {
        id: "cc_101",
        organizationId: "org_horizon",
        departmentId: "dept_ops",
        departmentName: "Operations & Clinical Facilities",
        code: "CC-1010",
        name: "ICU & Theatre Consumables",
      },
      {
        id: "cc_102",
        organizationId: "org_horizon",
        departmentId: "dept_lab",
        departmentName: "Pathology & Laboratory Sciences",
        code: "CC-2040",
        name: "Molecular Diagnostics Reagents",
      },
      {
        id: "cc_103",
        organizationId: "org_horizon",
        departmentId: "dept_it",
        departmentName: "Digital Health & IT Infrastructure",
        code: "CC-3010",
        name: "Cloud & Network Hardware",
      },
      {
        id: "cc_201",
        organizationId: "org_crestline",
        departmentId: "dept_civil",
        departmentName: "Heavy Plant & Structural Works",
        code: "CC-9010",
        name: "Structural Steel & Aggregates",
      },
    ],
    users: [
      {
        id: "usr_versaly_demo",
        organizationId: "org_horizon",
        fullName: "Versaly Labs Admin",
        email: "versalylabs@gmail.com",
        departmentName: "Executive & System Administration",
        role: "ADMIN",
        isActive: true,
      },
      {
        id: "usr_admin_1",
        organizationId: "org_horizon",
        fullName: "Samuel Kariuki",
        email: "s.kariuki@horizonmedical.org",
        departmentName: "System Administration",
        role: "ADMIN",
        isActive: true,
      },
      {
        id: "usr_hod_1",
        organizationId: "org_horizon",
        fullName: "Dr. Amina Odhiambo",
        email: "a.odhiambo@horizonmedical.org",
        departmentName: "Operations & Clinical Facilities",
        role: "DEPARTMENT_HEAD",
        isActive: true,
      },
      {
        id: "usr_proc_1",
        organizationId: "org_horizon",
        fullName: "Mercy Njoroge",
        email: "m.njoroge@horizonmedical.org",
        departmentName: "Procurement Unit",
        role: "PROCUREMENT_OFFICER",
        isActive: true,
      },
      {
        id: "usr_fin_1",
        organizationId: "org_horizon",
        fullName: "CPA Victor Mutua",
        email: "v.mutua@horizonmedical.org",
        departmentName: "Finance & Accounts",
        role: "FINANCE",
        isActive: true,
        delegatedToUserId: "usr_approver_1",
        delegationReason: "Annual Leave Cover (Delegated >$5k CFO review)",
        delegationEnd: "2026-10-18",
      },
      {
        id: "usr_approver_1",
        organizationId: "org_horizon",
        fullName: "Evelyn Chebet (MD / CEO)",
        email: "e.chebet@horizonmedical.org",
        departmentName: "Executive Office",
        role: "APPROVER",
        isActive: true,
      },
      {
        id: "usr_viewer_1",
        organizationId: "org_horizon",
        fullName: "Brian Otieno (Internal Audit)",
        email: "b.otieno@horizonmedical.org",
        departmentName: "Internal Risk & Audit",
        role: "VIEWER",
        isActive: true,
      },
      {
        id: "usr_supplier_1",
        organizationId: "org_horizon",
        fullName: "Apex Industrial Supplies Portal",
        email: "tenders@apexindustrial.co.ke",
        departmentName: "External Supplier",
        role: "SUPPLIER",
        isActive: true,
      },
    ],
    currencies: [
      {
        id: "cur_kes",
        organizationId: "org_horizon",
        code: "KES",
        name: "Kenyan Shilling",
        symbol: "KES",
        exchangeRate: 1.0,
        isBase: true,
      },
      {
        id: "cur_usd",
        organizationId: "org_horizon",
        code: "USD",
        name: "US Dollar",
        symbol: "$",
        exchangeRate: 0.0077,
        isBase: false,
      },
      {
        id: "cur_eur",
        organizationId: "org_horizon",
        code: "EUR",
        name: "Euro",
        symbol: "€",
        exchangeRate: 0.0071,
        isBase: false,
      },
    ],
    taxRates: [
      {
        id: "tax_vat16",
        organizationId: "org_horizon",
        code: "VAT-16",
        name: "Standard VAT (16%)",
        percentage: 16,
        isActive: true,
      },
      {
        id: "tax_wht5",
        organizationId: "org_horizon",
        code: "WHT-5",
        name: "Withholding Tax - Professional/Consultancy (5%)",
        percentage: 5,
        isActive: true,
      },
      {
        id: "tax_zero",
        organizationId: "org_horizon",
        code: "ZERO-MED",
        name: "Zero-Rated Medical Supplies (0%)",
        percentage: 0,
        isActive: true,
      },
    ],
    catalogItems: [
      {
        id: "cat_1",
        organizationId: "org_horizon",
        sku: "MED-hema-500",
        name: "Automated 5-Part Hematology Analyzer Reagent Kit",
        category: "Laboratory Reagents",
        specification: "ISO 13485 certified, 500-test pack, 12-month minimum shelf life",
        unitOfMeasure: "KIT",
        referenceUnitCost: 110500,
        currency: "KES",
        defaultMethod: "FRAMEWORK_AGREEMENT",
      },
      {
        id: "cat_2",
        organizationId: "org_horizon",
        sku: "IT-LTP-14P",
        name: "Enterprise Clinical Workstation Laptop 14-inch",
        category: "IT Hardware",
        specification: "32GB RAM, 1TB NVMe SSD, 3-Year Next-Business-Day Onsite Warranty",
        unitOfMeasure: "EA",
        referenceUnitCost: 188500,
        currency: "KES",
        defaultMethod: "COMPETITIVE_QUOTATION",
      },
      {
        id: "cat_3",
        organizationId: "org_horizon",
        sku: "OPS-PPE-N95",
        name: "Surgical N95 Particulate Respirator Masks (Box of 50)",
        category: "Clinical Consumables",
        specification: "NIOSH Approved, Fluid Resistant, Individually Sealed",
        unitOfMeasure: "BOX",
        referenceUnitCost: 8450,
        currency: "KES",
        defaultMethod: "RFQ",
      },
    ],
    approvalWorkflows: [
      {
        id: "wf_pr_std",
        organizationId: "org_horizon",
        name: "Standard Multi-Tier Purchase Requisition Chain",
        targetDocument: "PURCHASE_REQUISITION",
        isActive: true,
        steps: [
          {
            stepOrder: 1,
            stepName: "Level 1: Department Head (HOD) Endorsement",
            approverRole: "DEPARTMENT_HEAD",
            minThresholdAmount: 0,
            slaHours: 12,
          },
          {
            stepOrder: 2,
            stepName: "Level 2: Procurement Officer Method & Spec Check",
            approverRole: "PROCUREMENT_OFFICER",
            minThresholdAmount: 0,
            slaHours: 24,
          },
          {
            stepOrder: 3,
            stepName: "Level 3: Finance / CFO Budget Encumbrance Sign-Off (> KES 500,000)",
            approverRole: "FINANCE",
            minThresholdAmount: 500000,
            slaHours: 24,
          },
          {
            stepOrder: 4,
            stepName: "Level 4: Managing Director Executive Sign-Off (> KES 2,500,000)",
            approverRole: "APPROVER",
            minThresholdAmount: 2500000,
            slaHours: 48,
          },
        ],
      },
      {
        id: "wf_po_std",
        organizationId: "org_horizon",
        name: "Purchase Order Commitment & Award Release Workflow",
        targetDocument: "PURCHASE_ORDER",
        isActive: true,
        steps: [
          {
            stepOrder: 1,
            stepName: "Procurement Officer Quote Verification",
            approverRole: "PROCUREMENT_OFFICER",
            minThresholdAmount: 0,
            slaHours: 12,
          },
          {
            stepOrder: 2,
            stepName: "Finance Commitment Control (> KES 500,000)",
            approverRole: "FINANCE",
            minThresholdAmount: 500000,
            slaHours: 24,
          },
          {
            stepOrder: 3,
            stepName: "Executive MD Final Award Approval (> KES 1,500,000)",
            approverRole: "APPROVER",
            minThresholdAmount: 1500000,
            slaHours: 24,
          },
        ],
      },
    ],
    approvalQueue: [
      {
        id: "apq_1",
        organizationId: "org_horizon",
        referenceNo: "PR-2026-0041",
        documentType: "PURCHASE_REQUISITION",
        title: "Q4 Molecular Diagnostics PCR Reagent Replenishment (12 Kits)",
        departmentName: "Pathology & Laboratory Sciences",
        amount: 1326000,
        currency: "KES",
        currentStepOrder: 3,
        status: "UNDER_REVIEW",
        history: [
          {
            stepOrder: 1,
            stepName: "Level 1: Department Head (HOD) Endorsement",
            actorName: "Dr. Amina Odhiambo",
            actorRole: "DEPARTMENT_HEAD",
            decision: "APPROVED",
            comment: "Urgent Q4 clinical stock requirement verified against annual plan.",
            timestamp: "2026-10-04 09:15:00",
          },
          {
            stepOrder: 2,
            stepName: "Level 2: Procurement Officer Method & Spec Check",
            actorName: "Mercy Njoroge",
            actorRole: "PROCUREMENT_OFFICER",
            decision: "APPROVED",
            comment: "Catalog specs verified. Linked to Framework Agreement FA-2026-08.",
            timestamp: "2026-10-04 11:40:00",
          },
          {
            stepOrder: 3,
            stepName: "Level 3: Finance / CFO Budget Encumbrance Sign-Off (> KES 500,000)",
            actorName: "Evelyn Chebet (Delegated Cover for CPA Victor Mutua)",
            actorRole: "FINANCE",
            delegatedFrom: "CPA Victor Mutua",
            decision: "PENDING",
            comment: "Awaiting threshold (> KES 500,000) budget encumbrance sign-off.",
            timestamp: "2026-10-04 11:41:00",
          },
        ],
      },
      {
        id: "apq_2",
        organizationId: "org_horizon",
        referenceNo: "PR-2026-0042",
        documentType: "PURCHASE_REQUISITION",
        title: "20x Enterprise Clinical Workstation Laptops for Ward 4",
        departmentName: "Digital Health & IT Infrastructure",
        amount: 3770000,
        currency: "KES",
        currentStepOrder: 2,
        status: "UNDER_REVIEW",
        history: [
          {
            stepOrder: 1,
            stepName: "Level 1: Department Head (HOD) Endorsement",
            actorName: "Dr. Amina Odhiambo",
            actorRole: "DEPARTMENT_HEAD",
            decision: "APPROVED",
            comment: "Approved for Ward 4 EMR rollout.",
            timestamp: "2026-10-04 14:20:00",
          },
          {
            stepOrder: 2,
            stepName: "Level 2: Procurement Officer Method & Spec Check",
            actorName: "Mercy Njoroge",
            actorRole: "PROCUREMENT_OFFICER",
            decision: "PENDING",
            comment: "Requires Competitive Quotation (min 3 quotes).",
            timestamp: "2026-10-04 14:21:00",
          },
        ],
      },
    ],
    procurementMethods: createDefaultProcurementMethods(),
    procurementPlans: createDefaultProcurementPlans(),
    purchaseRequisitions: createDefaultPurchaseRequisitions(),
    suppliers: createDefaultSuppliers(),
    rfqs: createDefaultRfqs(),
    contracts: createDefaultContracts(),
    purchaseOrders: createDefaultPurchaseOrders(),
    goodsReceipts: createDefaultGoodsReceipts(),
    purchaseReturns: createDefaultPurchaseReturns(),
    supplierInvoices: createDefaultSupplierInvoices(),
    documentTemplates: createDefaultDocumentTemplates(),
    procurementAlerts: createDefaultProcurementAlerts(),
    enterpriseIntegrations: createDefaultEnterpriseIntegrations(),
    integrationSyncLogs: createDefaultIntegrationSyncLogs(),
    auditLogs: [
      {
        id: "aud_1",
        organizationId: "org_horizon",
        actorName: "Samuel Kariuki",
        actorRole: "ADMIN",
        action: "WORKFLOW.THRESHOLD_CONFIGURED",
        entityType: "ApprovalWorkflow",
        entityId: "wf_pr_std",
        summary:
          "Configured 4-tier PR approval workflow with KES 500,000 Finance/CFO threshold and KES 2,500,000 MD threshold.",
        ipAddress: "197.232.61.14",
        timestamp: "2026-10-04 08:30:12",
      },
      {
        id: "aud_2",
        organizationId: "org_horizon",
        actorName: "CPA Victor Mutua",
        actorRole: "FINANCE",
        action: "APPROVAL.DELEGATION_ENABLED",
        entityType: "User",
        entityId: "usr_fin_1",
        summary:
          "Activated vacation approval delegation to Evelyn Chebet (MD/CEO) until 2026-10-18.",
        ipAddress: "197.232.61.88",
        timestamp: "2026-10-04 09:00:45",
      },
      {
        id: "aud_3",
        organizationId: "org_horizon",
        actorName: "Mercy Njoroge",
        actorRole: "PROCUREMENT_OFFICER",
        action: "PR.STEP_APPROVED",
        entityType: "PurchaseRequisition",
        entityId: "PR-2026-0041",
        summary:
          "Approved Step 2 (Procurement Spec Check) on PR-2026-0041 (KES 1,326,000). Routed to Step 3 (Finance > KES 500,000).",
        ipAddress: "197.232.61.42",
        timestamp: "2026-10-04 11:40:19",
      },
    ],
  };
}

function createDefaultSuppliers(): SupplierRecord[] {
  return [
    {
      id: "sup_1",
      organizationId: "org_horizon",
      supplierCode: "SUP-2026-001",
      name: "Apex BioMedical & Diagnostics Ltd",
      category: "Laboratory Reagents &Consumables",
      contactPerson: "grace.mwangi@apexbiomed.co.ke",
      email: "tenders@apexbiomed.co.ke",
      phone: "+254 711 820 400",
      taxId: "PIN-P051882910Q",
      bankName: "Stanbic Bank Corporate",
      bankAccountNo: "0100004928172",
      approvalStatus: "APPROVED",
      isPreferred: true,
      isBlacklisted: false,
      deliveryTimeScore: 96,
      qualityRating: 4.8,
      priceCompetitivenessScore: 88,
      cumulativeSpend: 10985000,
      completedPoCount: 14,
      documents: [
        {
          id: "doc_1",
          docType: "KRA Tax Compliance Certificate",
          fileName: "Apex_Tax_Compliance_2026.pdf",
          expiryDate: "2027-03-31",
          status: "VALID",
        },
        {
          id: "doc_2",
          docType: "ISO 13485 Medical Devices Quality Cert",
          fileName: "Apex_ISO13485_Cert.pdf",
          expiryDate: "2027-08-15",
          status: "VALID",
        },
        {
          id: "doc_3",
          docType: "Pharmacy & Poisons Board Wholesale License",
          fileName: "PPB_Wholesale_2026.pdf",
          expiryDate: "2026-11-02",
          status: "EXPIRING_SOON",
        },
      ],
    },
    {
      id: "sup_2",
      organizationId: "org_horizon",
      supplierCode: "SUP-2026-002",
      name: "MedCore Surgical & Healthcare Supplies",
      category: "Clinical Consumables & PPE",
      contactPerson: "Daniel Kiprop",
      email: "bids@medcoresurgical.com",
      phone: "+254 722 901 334",
      taxId: "PIN-P051294811L",
      bankName: "KCB Corporate Banking",
      bankAccountNo: "1109482716",
      approvalStatus: "APPROVED",
      isPreferred: true,
      isBlacklisted: false,
      deliveryTimeScore: 91,
      qualityRating: 4.6,
      priceCompetitivenessScore: 94,
      cumulativeSpend: 6799000,
      completedPoCount: 9,
      documents: [
        {
          id: "doc_4",
          docType: "Tax Compliance Certificate",
          fileName: "MedCore_TCC_2026.pdf",
          expiryDate: "2027-05-20",
          status: "VALID",
        },
        {
          id: "doc_5",
          docType: "KEBS NIOSH N95 Import Certification",
          fileName: "MedCore_KEBS_N95.pdf",
          expiryDate: "2027-01-15",
          status: "VALID",
        },
      ],
    },
    {
      id: "sup_3",
      organizationId: "org_horizon",
      supplierCode: "SUP-2026-003",
      name: "EastAfrica Digital Systems & Enterprise IT",
      category: "IT Hardware & Networking",
      contactPerson: "Kevin Omondi",
      email: "enterprise@eadigitalsystems.co.ke",
      phone: "+254 733 410 920",
      taxId: "PIN-P052019384M",
      bankName: "NCBA Bank",
      bankAccountNo: "88019283741",
      approvalStatus: "APPROVED",
      isPreferred: false,
      isBlacklisted: false,
      deliveryTimeScore: 84,
      qualityRating: 4.3,
      priceCompetitivenessScore: 91,
      cumulativeSpend: 4056000,
      completedPoCount: 5,
      documents: [
        {
          id: "doc_6",
          docType: "OEM Tier-1 Authorized Partner Certificate",
          fileName: "EADigital_OEM_Partner.pdf",
          expiryDate: "2027-06-30",
          status: "VALID",
        },
      ],
    },
    {
      id: "sup_4",
      organizationId: "org_horizon",
      supplierCode: "SUP-2026-004",
      name: "PrimeLine General Traders Ltd",
      category: "Clinical Consumables & PPE",
      contactPerson: "Peter Njuguna",
      email: "sales@primelinetraders.co.ke",
      phone: "+254 720 112 998",
      taxId: "PIN-P051009281K",
      bankName: "Equity Bank",
      bankAccountNo: "018029384712",
      approvalStatus: "APPROVED",
      isPreferred: false,
      isBlacklisted: true,
      blacklistReason:
        "Blacklisted on 2026-08-14 due to 2 consecutive deliveries of short-dated/non-compliant surgical masks (GRN-2026-019).",
      deliveryTimeScore: 58,
      qualityRating: 2.1,
      priceCompetitivenessScore: 97,
      cumulativeSpend: 1820000,
      completedPoCount: 3,
      documents: [
        {
          id: "doc_7",
          docType: "Tax Compliance Certificate",
          fileName: "PrimeLine_TCC_Expired.pdf",
          expiryDate: "2026-07-01",
          status: "EXPIRED",
        },
      ],
    },
  ];
}

function createDefaultRfqs(): RfqRecord[] {
  return [
    {
      id: "rfq_1",
      organizationId: "org_horizon",
      rfqNumber: "RFQ-2026-0101",
      prId: "pr_1",
      prNumber: "PR-2026-0040",
      title: "Q4 Surgical Theatre N95 Respirators & Sterile Packs (100 Boxes)",
      departmentName: "Operations & Clinical Facilities",
      procurementMethod: "RFQ",
      estimatedBudget: 845000,
      currency: "KES",
      submissionDeadline: "2026-10-12",
      status: "ISSUED",
      invitedSupplierIds: ["sup_1", "sup_2", "sup_3"],
      quotations: [
        {
          id: "qt_1",
          supplierId: "sup_2",
          supplierName: "MedCore Surgical & Healthcare Supplies",
          quotedAmount: 773500,
          currency: "KES",
          leadTimeDays: 10,
          validityDays: 45,
          warrantyAndSpecsNote:
            "NIOSH N95 Certified, 24-month shelf life, batch test certs included, 10-day delivery.",
          isSelected: false,
          submittedAt: "2026-10-03 14:20",
        },
        {
          id: "qt_2",
          supplierId: "sup_1",
          supplierName: "Apex BioMedical & Diagnostics Ltd",
          quotedAmount: 829400,
          currency: "KES",
          leadTimeDays: 4,
          validityDays: 60,
          warrantyAndSpecsNote:
            "Immediate ex-stock Nairobi delivery (4 days), ISO 13485 surgical theatre grade, 36-month shelf life.",
          isSelected: false,
          submittedAt: "2026-10-03 16:05",
        },
        {
          id: "qt_3",
          supplierId: "sup_3",
          supplierName: "EastAfrica Digital Systems & Enterprise IT",
          quotedAmount: 890500,
          currency: "KES",
          leadTimeDays: 18,
          validityDays: 30,
          warrantyAndSpecsNote:
            "Imported on order, 18 days lead time.",
          isSelected: false,
          submittedAt: "2026-10-04 09:30",
        },
      ],
      clarifications: [
        {
          id: "clr_1",
          supplierName: "MedCore Surgical & Healthcare Supplies",
          question:
            "Can we deliver in two split batches (60 boxes immediately, 40 boxes within 10 days), or is single-lot delivery mandatory?",
          response:
            "Single-lot delivery is preferred, or full delivery within 10 calendar days of PO issue.",
          askedAt: "2026-10-02 11:20",
          respondedAt: "2026-10-02 15:05",
        },
      ],
    },
  ];
}

function createDefaultContracts(): SupplierContractRecord[] {
  return [
    {
      id: "cnt_1",
      organizationId: "org_horizon",
      contractNumber: "CNT-2026-FA08",
      title: "Annual Hematology & Molecular PCR Reagents Framework Agreement",
      supplierId: "sup_1",
      supplierName: "Apex BioMedical & Diagnostics Ltd",
      departmentId: "dept_lab",
      departmentName: "Pathology & Laboratory Sciences",
      ownerName: "Dr. Kenneth Mwangi",
      procurementMethod: "FRAMEWORK_AGREEMENT",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      renewalReminderDays: 60,
      ceilingValue: 15600000,
      utilizedSpend: 10985000,
      linkedPoNumbers: ["PO-2026-0012", "PO-2026-0029", "PO-2026-0054"],
      currency: "KES",
      status: "ACTIVE",
      versionNumber: 2,
      documentFileName: "Horizon_Apex_Framework_Agreement_v2.pdf",
      amendments: [
        {
          id: "amd_1",
          versionNumber: 2,
          amendmentSummary:
            "Increased annual ceiling from KES 13,000,000 to KES 15,600,000 to cover Q4 Molecular PCR test volume surge.",
          previousCeiling: 13000000,
          newCeiling: 15600000,
          newEndDate: "2026-12-31",
          amendedBy: "Evelyn Chebet (MD / CEO)",
          amendedAt: "2026-08-19",
        },
      ],
    },
    {
      id: "cnt_2",
      organizationId: "org_horizon",
      contractNumber: "CNT-2026-SL03",
      title: "Surgical Theatre Consumables & Sterilization Supply Contract",
      supplierId: "sup_2",
      supplierName: "MedCore Surgical & Healthcare Supplies",
      departmentId: "dept_ops",
      departmentName: "Operations & Clinical Facilities",
      ownerName: "Dr. Amina Odhiambo",
      procurementMethod: "TENDER",
      startDate: "2025-11-15",
      endDate: "2026-11-14",
      renewalReminderDays: 30,
      ceilingValue: 8450000,
      utilizedSpend: 6799000,
      linkedPoNumbers: ["PO-2026-0008", "PO-2026-0037"],
      currency: "KES",
      status: "EXPIRING",
      versionNumber: 1,
      documentFileName: "MedCore_Surgical_Supply_Contract_v1.pdf",
      amendments: [],
    },
  ];
}

function createDefaultPurchaseOrders(): PurchaseOrderRecord[] {
  return [
    {
      id: "po_1",
      organizationId: "org_horizon",
      poNumber: "PO-2026-0054",
      title: "Automated 5-Part Hematology Analyzer Reagent Kits (Call-Off Order)",
      supplierId: "sup_1",
      supplierName: "Apex BioMedical & Diagnostics Ltd",
      departmentId: "dept_lab",
      departmentName: "Pathology & Laboratory Sciences",
      prId: "pr_2",
      prNumber: "PR-2026-0041",
      contractId: "cnt_1",
      contractNumber: "CNT-2026-FA08",
      currency: "KES",
      totalAmount: 1326000,
      expectedDeliveryDate: "2026-10-16",
      confirmedDeliveryDate: "2026-10-14",
      supplierAckNote:
        "Acknowledged via Supplier Portal. Batch #HM-992 ready for dispatch.",
      status: "PARTIALLY_DELIVERED",
      versionNumber: 1,
      allowSplitDelivery: true,
      emailedToSupplierAt: "2026-10-02 10:00",
      createdAt: "2026-10-02 09:45",
      items: [
        {
          id: "poi_1",
          sku: "MED-hema-500",
          description: "Automated 5-Part Hematology Analyzer Reagent Kit",
          unitOfMeasure: "KIT",
          orderedQty: 12,
          receivedQty: 8,
          unitPrice: 110500,
          totalPrice: 1326000,
        },
      ],
      amendments: [],
    },
    {
      id: "po_2",
      organizationId: "org_horizon",
      poNumber: "PO-2026-0055",
      title: "Surgical N95 Particulate Respirator Masks (100 Boxes)",
      supplierId: "sup_2",
      supplierName: "MedCore Surgical & Healthcare Supplies",
      departmentId: "dept_ops",
      departmentName: "Operations & Clinical Facilities",
      prId: "pr_1",
      prNumber: "PR-2026-0040",
      rfqId: "rfq_1",
      rfqNumber: "RFQ-2026-0101",
      contractId: "cnt_2",
      contractNumber: "CNT-2026-SL03",
      currency: "KES",
      totalAmount: 773500,
      expectedDeliveryDate: "2026-10-18",
      status: "ISSUED",
      versionNumber: 1,
      allowSplitDelivery: true,
      emailedToSupplierAt: "2026-10-04 16:30",
      createdAt: "2026-10-04 16:25",
      items: [
        {
          id: "poi_2",
          sku: "OPS-PPE-N95",
          description: "Surgical N95 Particulate Respirator Masks (Box of 50)",
          unitOfMeasure: "BOX",
          orderedQty: 100,
          receivedQty: 0,
          unitPrice: 7735,
          totalPrice: 773500,
        },
      ],
      amendments: [],
    },
  ];
}

function createDefaultGoodsReceipts(): GoodsReceiptNoteRecord[] {
  return [
    {
      id: "grn_1",
      organizationId: "org_horizon",
      grnNumber: "GRN-2026-0088",
      poId: "po_1",
      poNumber: "PO-2026-0054",
      supplierId: "sup_1",
      supplierName: "Apex BioMedical & Diagnostics Ltd",
      departmentName: "Pathology & Laboratory Sciences",
      receivedBy: "Josephine Mutiso (Central Medical Stores)",
      deliveryNoteRef: "DN-APEX-8821",
      receivedAt: "2026-10-04 13:20",
      status: "PARTIALLY_RECEIVED",
      hasDiscrepancy: true,
      items: [
        {
          id: "grni_1",
          sku: "MED-hema-500",
          description: "Automated 5-Part Hematology Analyzer Reagent Kit",
          unitOfMeasure: "KIT",
          orderedQty: 12,
          receivedQtyThisGrn: 8,
          damagedOrShortQty: 1,
          conditionFlag: "SHORTAGE",
          discrepancyNote:
            "Partial split delivery: 8 of 12 kits delivered in good cold-chain condition; remaining 4 kits scheduled for next batch.",
        },
      ],
    },
  ];
}

function createDefaultPurchaseReturns(): PurchaseReturnRecord[] {
  return [
    {
      id: "ret_1",
      organizationId: "org_horizon",
      returnNumber: "RET-2026-0014",
      grnId: "grn_1",
      grnNumber: "GRN-2026-0088",
      poId: "po_1",
      poNumber: "PO-2026-0054",
      supplierId: "sup_1",
      supplierName: "Apex BioMedical & Diagnostics Ltd",
      departmentId: "dept_lab",
      departmentName: "Pathology & Laboratory Sciences",
      sku: "MED-hema-500",
      description: "Automated 5-Part Hematology Analyzer Reagent Kit",
      unitOfMeasure: "KIT",
      returnedQty: 1,
      unitPrice: 110500,
      returnAmount: 110500,
      reasonCode: "DAMAGED",
      reasonNotes:
        "1 kit rejected during warehouse cold-chain inspection due to punctured thermal seal on outer carton.",
      resolutionType: "CREDIT_NOTE_ADJUSTMENT",
      creditNoteNumber: "CN-APEX-2026-402",
      status: "SUPPLIER_ACKNOWLEDGED",
      budgetReleased: true,
      raisedBy: "Josephine Mutiso (Central Medical Stores)",
      createdAt: "2026-10-04 14:10",
    },
  ];
}

function createDefaultSupplierInvoices(): SupplierInvoiceRecord[] {
  return [
    {
      id: "inv_1",
      organizationId: "org_horizon",
      invoiceNumber: "INV-APEX-8821",
      internalVoucherNo: "PV-2026-0091",
      poId: "po_1",
      poNumber: "PO-2026-0054",
      grnId: "grn_1",
      grnNumber: "GRN-2026-0088",
      supplierId: "sup_1",
      supplierName: "Apex BioMedical & Diagnostics Ltd",
      departmentId: "dept_lab",
      departmentName: "Pathology & Laboratory Sciences",
      invoiceDate: "2026-10-04",
      dueDate: "2026-11-03",
      currency: "KES",
      sku: "MED-hema-500",
      description: "Automated 5-Part Hematology Analyzer Reagent Kit (Batch 1 Delivery)",
      unitOfMeasure: "KIT",
      invoicedQty: 7,
      invoicedUnitPrice: 110500,
      poOrderedQty: 12,
      poUnitPrice: 110500,
      grnAcceptedQty: 7, // 8 received minus 1 returned
      subtotalAmount: 884000,
      taxAmount: 0, // Zero-rated medical reagent
      creditNoteDeduction: 110500, // CN-APEX-2026-402 applied
      netPayableAmount: 773500,
      amountPaid: 383500,
      balanceDue: 390000,
      threeWayMatchStatus: "MATCHED",
      status: "PARTIALLY_PAID",
      scheduledPaymentDate: "2026-10-15",
      financeSignedOffBy: "CPA Victor Mutua (Finance)",
      createdAt: "2026-10-04 15:00",
      payments: [
        {
          id: "pay_1",
          paymentReference: "RTGS-STANBIC-994812",
          paymentMethod: "EFT_RTGS",
          amountPaid: 383500,
          paidBy: "CPA Victor Mutua (Finance)",
          paidAt: "2026-10-04 16:40",
        },
      ],
    },
    {
      id: "inv_2",
      organizationId: "org_horizon",
      invoiceNumber: "INV-APEX-8899-DISPUTE",
      internalVoucherNo: "PV-2026-0092",
      poId: "po_1",
      poNumber: "PO-2026-0054",
      grnId: "grn_1",
      grnNumber: "GRN-2026-0088",
      supplierId: "sup_1",
      supplierName: "Apex BioMedical & Diagnostics Ltd",
      departmentId: "dept_lab",
      departmentName: "Pathology & Laboratory Sciences",
      invoiceDate: "2026-10-04",
      dueDate: "2026-11-03",
      currency: "KES",
      sku: "MED-hema-500",
      description: "Automated 5-Part Hematology Analyzer Reagent Kit (Supplemental Claim)",
      unitOfMeasure: "KIT",
      invoicedQty: 8,
      invoicedUnitPrice: 116350,
      poOrderedQty: 12,
      poUnitPrice: 110500,
      grnAcceptedQty: 7,
      subtotalAmount: 930800,
      taxAmount: 0,
      creditNoteDeduction: 0,
      netPayableAmount: 930800,
      amountPaid: 0,
      balanceDue: 930800,
      threeWayMatchStatus: "BOTH_MISMATCH",
      status: "EXCEPTION_FLAGGED",
      createdAt: "2026-10-04 17:15",
      payments: [],
    },
  ];
}

function createDefaultDocumentTemplates(): DocumentTemplateRecord[] {
  return [
    {
      id: "tpl_1",
      organizationId: "org_horizon",
      templateCode: "TPL-PR-01",
      docType: "PURCHASE_REQUISITION",
      title: "Branded Purchase Requisition & Budget Encumbrance Voucher",
      versionNumber: 2,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: true,
      customFooterText:
        "Verified against Department Annual Procurement Plan & 4-Layer Budget Control.",
      updatedBy: "Samuel Kariuki (ADMIN)",
      updatedAt: "2026-10-04",
    },
    {
      id: "tpl_2",
      organizationId: "org_horizon",
      templateCode: "TPL-RFQ-02",
      docType: "REQUEST_FOR_QUOTATION",
      title: "Official Request for Quotation (RFQ) Invitation Dossier",
      versionNumber: 1,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: true,
      customFooterText:
        "All quotations must be submitted via the Vensure Supplier Portal before the deadline.",
      updatedBy: "Mercy Njoroge (PROCUREMENT_OFFICER)",
      updatedAt: "2026-10-04",
    },
    {
      id: "tpl_3",
      organizationId: "org_horizon",
      templateCode: "TPL-EVAL-03",
      docType: "QUOTATION_EVALUATION_REPORT",
      title: "Weighted Side-by-Side Quotation Comparison & Override Certificate",
      versionNumber: 2,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: false,
      customFooterText:
        "Includes mandatory justification if lowest-priced bidder was overridden.",
      updatedBy: "Mercy Njoroge (PROCUREMENT_OFFICER)",
      updatedAt: "2026-10-04",
    },
    {
      id: "tpl_4",
      organizationId: "org_horizon",
      templateCode: "TPL-AWD-04",
      docType: "AWARD_LETTER",
      title: "Official Notification of Procurement Award Letter",
      versionNumber: 1,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: true,
      customFooterText:
        "Subject to formal Purchase Order acknowledgment within 48 hours.",
      updatedBy: "Evelyn Chebet (MD / CEO)",
      updatedAt: "2026-10-04",
    },
    {
      id: "tpl_5",
      organizationId: "org_horizon",
      templateCode: "TPL-PO-05",
      docType: "PURCHASE_ORDER",
      title: "Official Purchase Order (PO) & Commercial Terms Contract",
      versionNumber: 3,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: true,
      customFooterText:
        "Quote PO Number on all Delivery Notes and Tax Invoices for 3-Way Matching.",
      updatedBy: "Samuel Kariuki (ADMIN)",
      updatedAt: "2026-10-04",
    },
    {
      id: "tpl_6",
      organizationId: "org_horizon",
      templateCode: "TPL-GRN-06",
      docType: "GOODS_RECEIPT_NOTE",
      title: "Warehouse Goods Receipt Note (GRN) & Quality Inspection Certificate",
      versionNumber: 1,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: false,
      customFooterText:
        "Financial unit prices masked on warehouse copies in accordance with RBAC policy.",
      updatedBy: "Samuel Kariuki (ADMIN)",
      updatedAt: "2026-10-04",
    },
    {
      id: "tpl_7",
      organizationId: "org_horizon",
      templateCode: "TPL-RET-07",
      docType: "PURCHASE_RETURN_NOTE",
      title: "Official Purchase Return & Supplier Debit Note",
      versionNumber: 1,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: true,
      customFooterText:
        "Credit Note adjustment automatically releases encumbered/committed department budget.",
      updatedBy: "CPA Victor Mutua (FINANCE)",
      updatedAt: "2026-10-04",
    },
    {
      id: "tpl_8",
      organizationId: "org_horizon",
      templateCode: "TPL-SUP-08",
      docType: "SUPPLIER_EVALUATION_REPORT",
      title: "5-Pillar Supplier Performance Scorecard & Compliance Dossier",
      versionNumber: 1,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: false,
      customFooterText:
        "Evaluates Quality, On-Time Delivery, Price Competitiveness, and Tax/ISO Compliance.",
      updatedBy: "Mercy Njoroge (PROCUREMENT_OFFICER)",
      updatedAt: "2026-10-04",
    },
    {
      id: "tpl_9",
      organizationId: "org_horizon",
      templateCode: "TPL-RPT-09",
      docType: "PROCUREMENT_EXECUTIVE_REPORT",
      title: "Executive Spend, Cycle-Time & 3-Way Match Audit Report",
      versionNumber: 1,
      includeLogo: true,
      includeSignatureBlocks: true,
      includeTermsAndConditions: false,
      customFooterText:
        "Cryptographically verified against the Organization Immutable Audit Trail.",
      updatedBy: "Evelyn Chebet (MD / CEO)",
      updatedAt: "2026-10-04",
    },
  ];
}

function createDefaultProcurementAlerts(): ProcurementAlertRecord[] {
  return [
    {
      id: "alt_1",
      organizationId: "org_horizon",
      alertType: "INVOICE_3WAY_MISMATCH",
      severity: "CRITICAL",
      title: "3-Way Match Failure on INV-APEX-8899-DISPUTE (KES 930,800)",
      description:
        "Supplier billed 8 KIT @ KES 116,350 vs. Warehouse GRN-2026-0088 Net Accepted 7 KIT @ PO Price KES 110,500. Payment automatically blocked pending exception resolution.",
      referenceNo: "INV-APEX-8899-DISPUTE",
      targetHref: "/phase5?tab=match",
      channels: "IN_APP, EMAIL",
      status: "ACTIVE",
      createdAt: "2026-10-04 17:16",
    },
    {
      id: "alt_2",
      organizationId: "org_horizon",
      alertType: "PENDING_APPROVAL_ESCALATION",
      severity: "WARNING",
      title: "Approval SLA Escalation: PR-2026-0041 (KES 1,326,000) Awaiting Level 3 Finance",
      description:
        "PR-2026-0041 (Molecular Diagnostics PCR Reagents) has exceeded 12h SLA at Level 3 (> KES 500,000 Finance Sign-Off). Escalated to Delegated Cover Evelyn Chebet (MD/CEO).",
      referenceNo: "PR-2026-0041",
      targetHref: "/admin?tab=workflows",
      channels: "IN_APP, EMAIL",
      status: "ACTIVE",
      createdAt: "2026-10-04 16:00",
    },
    {
      id: "alt_3",
      organizationId: "org_horizon",
      alertType: "BUDGET_THRESHOLD_WARNING",
      severity: "WARNING",
      title: "Department Budget > 75% Threshold: Operations & Clinical Facilities",
      description:
        "Operations & Clinical Facilities has reached 80% total utilization (KES 2.6M Encumbered + KES 4.55M Committed + KES 3.25M Actual = KES 10.4M of KES 13.0M FY2026 budget).",
      referenceNo: "DEPT-OPS",
      targetHref: "/phase2?tab=budget",
      channels: "IN_APP, EMAIL",
      status: "ACTIVE",
      createdAt: "2026-10-04 15:30",
    },
    {
      id: "alt_4",
      organizationId: "org_horizon",
      alertType: "CONTRACT_RENEWAL_REMINDER",
      severity: "WARNING",
      title: "30-Day Contract Expiry Alert: CNT-2026-SL03 (MedCore Surgical)",
      description:
        "Surgical Theatre Consumables Contract (CNT-2026-SL03, Ceiling KES 8,450,000, Utilized 80.5%) expires on 2026-11-14. Initiate renewal or tender.",
      referenceNo: "CNT-2026-SL03",
      targetHref: "/phase3?tab=contracts",
      channels: "IN_APP, EMAIL",
      status: "ACTIVE",
      createdAt: "2026-10-04 14:45",
    },
    {
      id: "alt_5",
      organizationId: "org_horizon",
      alertType: "EXPIRING_SUPPLIER_CERTIFICATE",
      severity: "WARNING",
      title: "Supplier License Expiring inside 30 Days: Apex BioMedical PPB License",
      description:
        "Pharmacy & Poisons Board Wholesale License (PPB_Wholesale_2026.pdf) for Apex BioMedical & Diagnostics Ltd expires on 2026-11-02.",
      referenceNo: "SUP-2026-001",
      targetHref: "/phase3?tab=suppliers",
      channels: "IN_APP, EMAIL",
      status: "ACTIVE",
      createdAt: "2026-10-04 14:20",
    },
    {
      id: "alt_6",
      organizationId: "org_horizon",
      alertType: "RFQ_DEADLINE_CLOSING_48H",
      severity: "INFO",
      title: "RFQ Closing Alert: RFQ-2026-0101 (3 Supplier Quotations Received)",
      description:
        "RFQ-2026-0101 (Q4 Surgical Theatre N95 Respirators) has received 3 quotes (KES 773,500 – KES 890,500) and is ready for weighted evaluation.",
      referenceNo: "RFQ-2026-0101",
      targetHref: "/phase3?tab=evaluation",
      channels: "IN_APP, EMAIL",
      status: "ACTIVE",
      createdAt: "2026-10-04 13:50",
    },
    {
      id: "alt_7",
      organizationId: "org_horizon",
      alertType: "OVERDUE_PO_DELIVERY",
      severity: "WARNING",
      title: "PO Awaiting Supplier Confirmation: PO-2026-0055 (KES 773,500)",
      description:
        "PO-2026-0055 issued to MedCore Surgical & Healthcare Supplies is awaiting Supplier Portal acknowledgment and delivery date confirmation.",
      referenceNo: "PO-2026-0055",
      targetHref: "/portal?tab=pos",
      channels: "IN_APP, EMAIL",
      status: "ACTIVE",
      createdAt: "2026-10-04 16:35",
    },
    {
      id: "alt_8",
      organizationId: "org_horizon",
      alertType: "PURCHASE_RETURN_UPDATE",
      severity: "INFO",
      title: "Purchase Return Credit Note Acknowledged: RET-2026-0014 (KES 110,500)",
      description:
        "Apex BioMedical acknowledged RET-2026-0014 (1 damaged reagent kit on GRN-2026-0088) and issued Credit Note CN-APEX-2026-402. Committed budget released.",
      referenceNo: "RET-2026-0014",
      targetHref: "/phase5?tab=returns",
      channels: "IN_APP, EMAIL",
      status: "ACKNOWLEDGED",
      createdAt: "2026-10-04 14:15",
    },
  ];
}

function createDefaultEnterpriseIntegrations(): EnterpriseIntegrationRecord[] {
  return [
    {
      id: "int_qbo",
      organizationId: "org_horizon",
      connectorKey: "QUICKBOOKS_ONLINE",
      providerName: "Intuit QuickBooks Online",
      category: "ACCOUNTING",
      description:
        "Two-way Chart of Accounts, 3-Way Matched AP Bills (PV), Vendor Credit Notes, and EFT/RTGS Payment Settlement sync.",
      status: "CONNECTED",
      endpointOrAccountRef: "QBO-RealmID: 9130-3491-8820 (Horizon Medical GL)",
      syncDirection: "TWO_WAY_GL_AND_AP",
      autoSyncInvoices: true,
      lastSyncedAt: "2026-10-04 16:41:00",
      totalSyncedRecords: 48,
    },
    {
      id: "int_xero",
      organizationId: "org_horizon",
      connectorKey: "XERO_ACCOUNTING",
      providerName: "Xero Cloud Accounting",
      category: "ACCOUNTING",
      description:
        "Automated export of Approved Purchase Orders, 3-Way Matched Invoices, and Multi-Currency Tax Rates.",
      status: "SANDBOX_ACTIVE",
      endpointOrAccountRef: "xero-tenant://horizon-medical-ea-sandbox",
      syncDirection: "PUSH_PO_AND_BILLS",
      autoSyncInvoices: false,
      lastSyncedAt: "2026-10-03 18:10:00",
      totalSyncedRecords: 19,
    },
    {
      id: "int_sage",
      organizationId: "org_horizon",
      connectorKey: "SAGE_200_EVOLUTION",
      providerName: "Sage 200 / Sage Intacct",
      category: "ACCOUNTING",
      description:
        "Departmental Cost Center encumbrance journal postings and Supplier Ledger batch reconciliation.",
      status: "DISCONNECTED",
      endpointOrAccountRef: "https://api.sage.com/v3/companies/horizon-med",
      syncDirection: "BATCH_JOURNAL_SYNC",
      autoSyncInvoices: false,
      lastSyncedAt: "Never",
      totalSyncedRecords: 0,
    },
    {
      id: "int_sap",
      organizationId: "org_horizon",
      connectorKey: "SAP_B1_ODOO_ERP",
      providerName: "SAP Business One & Odoo ERP Bridge",
      category: "ERP_INVENTORY",
      description:
        "Real-time Warehouse Stock Valuation, GRN Batch/Expiry Lot Receipt sync, and Master Item Catalog sync.",
      status: "CONNECTED",
      endpointOrAccountRef: "https://erp-bridge.horizonmedical.org/odata/v4",
      syncDirection: "TWO_WAY_INVENTORY_GRN",
      autoSyncInvoices: true,
      lastSyncedAt: "2026-10-04 13:21:00",
      totalSyncedRecords: 112,
    },
    {
      id: "int_sso",
      organizationId: "org_horizon",
      connectorKey: "GOOGLE_M365_OIDC_SSO",
      providerName: "Google Workspace & Microsoft Entra ID (365) SSO",
      category: "SSO_IDENTITY",
      description:
        "Enterprise OIDC / SAML 2.0 Single Sign-On with automated 7-Role RBAC group claim mapping and MFA enforcement.",
      status: "CONNECTED",
      endpointOrAccountRef: "oidc://login.microsoftonline.com/horizonmedical.org",
      syncDirection: "IDENTITY_PROVIDER_AUTH",
      autoSyncInvoices: false,
      lastSyncedAt: "2026-10-04 17:00:00",
      totalSyncedRecords: 36,
    },
    {
      id: "int_s3",
      organizationId: "org_horizon",
      connectorKey: "AWS_S3_DOCUMENT_VAULT",
      providerName: "AWS S3 & Google Cloud Storage Vault",
      category: "CLOUD_STORAGE",
      description:
        "Encrypted object storage for Supplier Tax/ISO Certificates, Signed Contracts, Branded PDFs, and GRN Inspection Photos.",
      status: "CONNECTED",
      endpointOrAccountRef: "s3://vensure-prod-vault-af-south-1/org_horizon",
      syncDirection: "IMMUTABLE_BLOB_ARCHIVE",
      autoSyncInvoices: true,
      lastSyncedAt: "2026-10-04 16:30:00",
      totalSyncedRecords: 214,
    },
    {
      id: "int_twilio_wa",
      organizationId: "org_horizon",
      connectorKey: "TWILIO_WHATSAPP_SENDGRID",
      providerName: "Twilio SMS, WhatsApp Business API & SendGrid SMTP",
      category: "COMMUNICATION_ALERTS",
      description:
        "Multi-channel instant dispatch for Approval SLA Escalations, PO Issuances, and 3-Way Match Exception Alerts.",
      status: "CONNECTED",
      endpointOrAccountRef: "whatsapp:+254709112000 / smtp.sendgrid.net",
      syncDirection: "OUTBOUND_OMNICHANNEL",
      autoSyncInvoices: true,
      lastSyncedAt: "2026-10-04 17:16:00",
      totalSyncedRecords: 89,
    },
  ];
}

function createDefaultIntegrationSyncLogs(): IntegrationSyncLogRecord[] {
  return [
    {
      id: "slog_1",
      organizationId: "org_horizon",
      connectorKey: "QUICKBOOKS_ONLINE",
      providerName: "Intuit QuickBooks Online",
      eventType: "AP_BILL_AND_PAYMENT_VOUCHER_SYNC",
      referenceNo: "INV-APEX-8821 / PV-2026-0091",
      payloadSummary:
        "Posted 3-Way Matched AP Bill ($5,950 net after Credit Note CN-APEX-2026-402 $850) + RTGS Partial Payment ($2,950) to GL Account 2100-Accounts Payable.",
      status: "SUCCESS",
      syncedBy: "CPA Victor Mutua (FINANCE)",
      timestamp: "2026-10-04 16:41:05",
    },
    {
      id: "slog_2",
      organizationId: "org_horizon",
      connectorKey: "SAP_B1_ODOO_ERP",
      providerName: "SAP Business One & Odoo ERP Bridge",
      eventType: "GRN_INVENTORY_STOCK_RECEIPT",
      referenceNo: "GRN-2026-0088 / PO-2026-0054",
      payloadSummary:
        "Updated Central Medical Stores stock for SKU MED-hema-500 (+7 net accepted kits; 1 kit quarantined under RET-2026-0014).",
      status: "SUCCESS",
      syncedBy: "Josephine Mutiso (WAREHOUSE)",
      timestamp: "2026-10-04 13:21:12",
    },
    {
      id: "slog_3",
      organizationId: "org_horizon",
      connectorKey: "TWILIO_WHATSAPP_SENDGRID",
      providerName: "Twilio SMS, WhatsApp Business API & SendGrid SMTP",
      eventType: "WHATSAPP_CRITICAL_3WAY_MISMATCH_ALERT",
      referenceNo: "INV-APEX-8899-DISPUTE",
      payloadSummary:
        "Dispatched WhatsApp Business template [3way_match_exception_v1] & SendGrid email alert to Finance & Procurement Officer for $7,160 invoice discrepancy.",
      status: "SUCCESS",
      syncedBy: "Vensure Automated Alert Engine",
      timestamp: "2026-10-04 17:16:08",
    },
    {
      id: "slog_4",
      organizationId: "org_horizon",
      connectorKey: "AWS_S3_DOCUMENT_VAULT",
      providerName: "AWS S3 & Google Cloud Storage Vault",
      eventType: "CONTRACT_AND_PO_PDF_ARCHIVE",
      referenceNo: "PO-2026-0055 / CNT-2026-FA08",
      payloadSummary:
        "Archived SHA-256 signed PDF dossier to s3://vensure-prod-vault-af-south-1/org_horizon/2026/10/PO-2026-0055.pdf.",
      status: "SUCCESS",
      syncedBy: "Mercy Njoroge (PROCUREMENT_OFFICER)",
      timestamp: "2026-10-04 16:30:22",
    },
  ];
}

export function getPhase1State(): Phase1DatabaseState {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<Phase1DatabaseState>;
      const seed = createInitialSeedState();

      const existingUsers = parsed.users ?? seed.users;
      const hasVersalyDemo = existingUsers.some(
        (u) => u.email.toLowerCase() === "versalylabs@gmail.com"
      );
      const mergedUsers = hasVersalyDemo
        ? existingUsers
        : [seed.users[0], ...existingUsers];

      // Seamless upgrade to KES if local DB file was created with USD base
      const isLegacyUsd =
        parsed.organizations?.some((o) => o.baseCurrency === "USD") ||
        parsed.currencies?.some((c) => c.isBase && c.code === "USD") ||
        parsed.departments?.some((d) => d.currency === "USD");

      if (isLegacyUsd) {
        // Upgrade baseline state to Kenyan Shillings (KES)
        const fresh = createInitialSeedState();
        savePhase1State(fresh);
        return fresh;
      }

      const merged: Phase1DatabaseState = {
        ...seed,
        ...parsed,
        users: mergedUsers,
        activePortalSupplierId:
          parsed.activePortalSupplierId || seed.activePortalSupplierId,
        departments: (parsed.departments ?? seed.departments).map((d) => ({
          ...d,
          fiscalPeriod: d.fiscalPeriod || "FY2026",
          currency: d.currency || "KES",
          warningThresholdPct: d.warningThresholdPct ?? 70,
          criticalThresholdPct: d.criticalThresholdPct ?? 90,
        })),
        procurementMethods:
          parsed.procurementMethods && parsed.procurementMethods.length > 0
            ? parsed.procurementMethods
            : seed.procurementMethods,
        procurementPlans:
          parsed.procurementPlans && parsed.procurementPlans.length > 0
            ? parsed.procurementPlans
            : seed.procurementPlans,
        purchaseRequisitions:
          parsed.purchaseRequisitions && parsed.purchaseRequisitions.length > 0
            ? parsed.purchaseRequisitions
            : seed.purchaseRequisitions,
        suppliers:
          parsed.suppliers && parsed.suppliers.length > 0
            ? parsed.suppliers
            : seed.suppliers,
        rfqs:
          parsed.rfqs && parsed.rfqs.length > 0 ? parsed.rfqs : seed.rfqs,
        contracts:
          parsed.contracts && parsed.contracts.length > 0
            ? parsed.contracts
            : seed.contracts,
        purchaseOrders:
          parsed.purchaseOrders && parsed.purchaseOrders.length > 0
            ? parsed.purchaseOrders
            : seed.purchaseOrders,
        goodsReceipts:
          parsed.goodsReceipts && parsed.goodsReceipts.length > 0
            ? parsed.goodsReceipts
            : seed.goodsReceipts,
        purchaseReturns:
          parsed.purchaseReturns && parsed.purchaseReturns.length > 0
            ? parsed.purchaseReturns
            : seed.purchaseReturns,
        supplierInvoices:
          parsed.supplierInvoices && parsed.supplierInvoices.length > 0
            ? parsed.supplierInvoices
            : seed.supplierInvoices,
        documentTemplates:
          parsed.documentTemplates && parsed.documentTemplates.length > 0
            ? parsed.documentTemplates
            : seed.documentTemplates,
        procurementAlerts:
          parsed.procurementAlerts && parsed.procurementAlerts.length > 0
            ? parsed.procurementAlerts
            : seed.procurementAlerts,
        enterpriseIntegrations:
          parsed.enterpriseIntegrations &&
          parsed.enterpriseIntegrations.length > 0
            ? parsed.enterpriseIntegrations
            : seed.enterpriseIntegrations,
        integrationSyncLogs:
          parsed.integrationSyncLogs && parsed.integrationSyncLogs.length > 0
            ? parsed.integrationSyncLogs
            : seed.integrationSyncLogs,
      };
      return merged;
    }
  } catch {
    // Fallback to initial seed
  }
  const initial = createInitialSeedState();
  savePhase1State(initial);
  return initial;
}

export function savePhase1State(state: Phase1DatabaseState): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem errors in serverless environments
  }
}

export function appendAuditEntry(
  state: Phase1DatabaseState,
  entry: Omit<AuditLogEntry, "id" | "timestamp" | "ipAddress">
): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ipAddress: "127.0.0.1",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
  state.auditLogs.unshift(newEntry);
  return newEntry;
}
