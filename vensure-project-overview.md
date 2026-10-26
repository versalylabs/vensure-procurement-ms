# Vensure — Procurement Management System
### Product Overview & Feature Scope
*Developed by Versaly | Target: Medium-sized companies, NGOs, Schools, Hospitals, Construction, Hotels, Manufacturers*

---

## End-to-End Procurement Lifecycle

Every stage maintains its own **status, timestamps, responsible user, documents, and audit history**.

```text
Purchase Plan
      ↓
Purchase Requisition
      ↓
Approval
      ↓
RFQ / Procurement Method
      ↓
Supplier Quotations
      ↓
Evaluation & Selection
      ↓
Purchase Order
      ↓
Supplier Confirmation
      ↓
Delivery
      ↓
GRN
      ↓
Invoice
      ↓
3-Way Match
      ↓
Invoice Approval
      ↓
Payment
      ↓
Supplier Performance
      ↓
Reporting
```

---

## Module Index

| # | Module | Priority |
|---|--------|----------|
| 1 | Procurement Planning | 🔴 High |
| 2 | Organization & Multi-Tenancy | Core |
| 3 | Purchase Requisition | Core |
| 4 | Approval Workflows | Core |
| 5 | Procurement Methods | 🔴 High |
| 6 | Request for Quotation (RFQ) | Core |
| 7 | Supplier Management | Core |
| 8 | Quotation Comparison & Selection | Core |
| 9 | Budget Control & Commitment | 🔴 High |
| 10 | Contract Management | 🔴 High |
| 11 | Purchase Order (PO) | Core |
| 12 | Supplier Portal | 🟠 Medium |
| 13 | Goods Receipt Note (GRN) | Core |
| 14 | Purchase Returns & Rejections | 🟠 Medium |
| 15 | Invoice & Payment | Core |
| 16 | Procurement Documents & Templates | 🟠 Medium |
| 17 | Procurement Workspace | 🟢 Recommended |
| 18 | Reporting & Analytics | Core |
| 19 | Notifications & Alerts | Core |
| 20 | System Administration | Core |
| 21 | Integrations (Phase 2+) | Phase 2 |

---

## 1. 📅 Procurement Planning

*Gives management visibility into what the organization **intends to buy**, not just what has already been requested.*

- Annual and periodic procurement plans
- Planned procurement category and description
- Estimated budget per planned item
- Expected procurement date / quarter
- Responsible department
- Procurement method (see Module 5)
- Status tracking: `Planned → Active → Completed`
- Planned vs. Actual procurement tracking (link plans to raised PRs)
- Procurement plan approval before activation
- Dashboard view of plan execution progress

---

## 2. 🏢 Organization & Multi-Tenancy

- Multi-company / multi-branch support (one instance per client)
- Department and cost-center management
- Role-based access control (RBAC):
  - Admin, Department Head, Procurement Officer, Finance, Approver, Viewer, Supplier
- Audit log on every action (who did what, when, from which IP)

---

## 3. 📋 Purchase Requisition (PR)

- Any staff member can raise a purchase request
- Attach item descriptions, quantities, estimated cost, required date
- Link to a department, cost center, and budget line
- Link PR to an existing procurement plan (optional)
- Requisition status tracking: `Draft → Submitted → Under Review → Approved / Rejected`
- Rejection with mandatory reason + ability to revise and resubmit
- PR document generation (PDF)

---

## 4. ✅ Approval Workflows

- Configurable multi-level approval chains (e.g., HOD → Procurement → Finance → MD)
- Approval thresholds by amount (e.g., above \$5,000 requires CFO sign-off)
- Email + in-app notifications for pending approvals
- Approval delegation (vacation cover)
- Full approval history with timestamps and comments
- Applicable across PRs, POs, invoices, and contracts

---

## 5. 🔀 Procurement Methods

*The selected method influences the workflow steps and documentation requirements.*

| Method | Description |
|--------|-------------|
| **Direct Purchase** | Low-value, no quotation required |
| **RFQ** | Standard request for quotation |
| **Competitive Quotation** | Minimum 3 quotes required |
| **Tender** | Full public or selective tender process |
| **Framework Agreement** | Call-off from a pre-agreed supplier list |
| **Emergency Procurement** | Fast-tracked, post-hoc documentation |
| **Single-Source** | One supplier justified; mandatory justification |

- Each method has its own configurable workflow and required documentation checklist
- Procurement method can be defined at the planning stage or selected at RFQ stage
- Audit requirement: deviating from the planned method requires a justification note

---

## 6. 📨 Request for Quotation (RFQ)

- Auto-generate RFQ from an approved PR
- Invite multiple registered suppliers to quote
- Set RFQ submission deadline
- Suppliers receive email with a secure link to submit their quote
- Clarification requests between procurement team and suppliers (tracked)
- RFQ document template (branded PDF export)
- RFQ status: `Draft → Issued → Closed → Evaluated`

---

## 7. 🏭 Supplier Management

- Supplier registry (name, contacts, category, tax ID, bank details)
- Supplier onboarding, verification, and approval status
- Supplier performance scores (delivery time, quality rating, price competitiveness)
- Blacklist / preferred supplier flags
- Document vault per supplier (contracts, certifications, licenses)
- Supplier spend history and PO history
- Link suppliers to contracts (Module 10)

---

## 8. 💰 Quotation Comparison & Supplier Selection

- Side-by-side quote comparison table
- Weighted scoring (price, lead time, quality, past performance)
- Quotation evaluation form (configurable, exportable)
- Selection justification field (mandatory audit trail)
- Override alerts (cheapest not selected → must provide reason)
- Single-source and emergency procurement bypass with justification

---

## 9. 📊 Budget Control & Commitment

*Distinguishes between committed budget and actual spend — critical for accurate financial control.*

**Budget Breakdown per Department:**

| Layer | Example |
|-------|---------|
| Total Department Budget | \$100,000 |
| Approved PRs (Encumbered) | \$20,000 |
| Open POs (Committed) | \$35,000 |
| Paid Invoices (Actual Spend) | \$25,000 |
| **Available Budget** | **\$20,000** |

- Budget setup per department, cost center, and period
- Budget commitment on PR approval (encumbrance)
- Budget commitment on PO issue (firm commitment)
- Budget release on PO cancellation or partial return
- Alerts when department hits configurable thresholds (e.g., 70%, 90%)
- Budget vs. Actual vs. Committed report
- Multi-currency budget support

---

## 10. 📄 Contract Management

*Contracts are operational, not just document storage.*

- Supplier contract registry
- Contract start/end dates and contract value
- Contract status: `Draft → Active → Expiring → Expired → Terminated`
- Contract owner and responsible department
- Procurement method (e.g., Framework Agreement, Tender)
- Contract document storage (PDF, DOCX)
- Renewal dates with configurable advance reminders (e.g., 90/60/30 days)
- Expiry alerts to contract owner and procurement team
- Contract spend tracking (sum of all POs linked to the contract)
- Link contracts to suppliers and POs
- Contract amendment history and version control

---

## 11. 📦 Purchase Order (PO)

- Auto-generate PO from selected quote
- PO numbering, versioning, and amendment tracking
- Supplier acknowledgment tracking (see Supplier Portal, Module 12)
- PO PDF export + email to supplier
- Partial order and split delivery support
- PO status: `Draft → Issued → Acknowledged → Partially Delivered → Completed / Cancelled`
- Link PO to contract (if applicable)

---

## 12. 🌐 Supplier Portal

*A dedicated external-facing portal — a major differentiator for Vensure.*

Suppliers can:

- Register and maintain their company profile
- Receive and view RFQs
- Submit and revise quotations
- Upload required documents (certifications, samples)
- View RFQ status and results
- Respond to clarification requests from the procurement team
- Accept or reject issued POs
- Confirm expected delivery dates
- View their full procurement history with the organization
- Update selected company information (contacts, banking, etc.)

Portal is secure, branded per client organization, and accessible via unique supplier login.

---

## 13. 🚚 Goods Receipt Note (GRN)

- Record received goods against PO line items
- Flag shortages, damages, or substitutions
- Warehouse staff can confirm receipt without finance access
- Partial delivery recording
- GRN document generation
- **Three-way matching: PO ↔ GRN ↔ Invoice**
- GRN status: `Pending → Partially Received → Fully Received`

---

## 14. 🔄 Purchase Returns & Rejections

- Record rejected or defective goods from a GRN
- Return quantities and reasons (damaged, incorrect spec, expired, short-dated)
- Return authorization and approval
- Return status: `Raised → Approved → Dispatched → Acknowledged`
- Replacement request or credit note request
- Credit note tracking and reconciliation against invoices
- Supplier communication log for returns
- Impact on budget commitment (auto-release on accepted return)

---

## 15. 🧾 Invoice & Payment

- Supplier invoice upload (PDF) and data entry
- Automated three-way match: **PO ↔ GRN ↔ Invoice**
- Mismatch flagging with resolution workflow
- Invoice approval before payment authorization
- Payment scheduling and due date tracking
- Partial payment recording
- Payment status: `Pending → Approved → Scheduled → Paid`
- Credit note application before payment
- Integration hooks for accounting software (QuickBooks, Xero, Sage, custom ERP)

---

## 16. 📁 Procurement Documents & Templates

*Every transaction has a connected document trail from plan to payment.*

**Document Trail per Transaction:**
```
Procurement Plan → PR → RFQ → Quotations → Evaluation Report
→ Award Letter → PO → GRN → Purchase Return (if any) → Invoice → Payment
```

**Configurable Templates for:**
- Purchase Requisition
- Request for Quotation
- Quotation Evaluation / Comparison Report
- Purchase Order
- Goods Receipt Note
- Purchase Return Note
- Supplier Evaluation Report
- Award Letter
- Procurement Reports

Templates are:
- Branded with client organization logo and details
- Exportable as PDF
- Configurable fields per organization
- Version-controlled

---

## 17. 🖥️ Procurement Workspace

*The central operational home for the procurement team — not a report, a live action dashboard.*

Workspace panels:

| Panel | What it shows |
|-------|--------------|
| New PRs | Awaiting procurement team pickup |
| PRs Awaiting Action | Stalled or pending decisions |
| Active RFQs | Currently open, with days remaining |
| RFQs Closing Soon | Within 48 hours of deadline |
| Quotes Awaiting Evaluation | Ready to compare |
| POs Awaiting Supplier Confirmation | Issued but not acknowledged |
| Overdue Deliveries | Past expected delivery date |
| Pending GRNs | Deliveries awaiting receipt confirmation |
| Invoice Mismatches | Three-way match failures |
| Supplier Issues | Returns, disputes, clarifications |

- Each item is clickable and leads directly to the relevant transaction
- Filter by department, category, or assigned officer
- Counts and urgency indicators on each panel

---

## 18. 📈 Reporting & Analytics

**Management can always answer:**
> "Who requested this?" "Who approved it?" "Which suppliers quoted?" "Why was this supplier selected?" "How much have we spent with them?"

Reports include:
- **Spend analytics**: by department, supplier, category, time period
- **Requisition-to-PO cycle time** (procurement efficiency)
- **Supplier spend ranking** and concentration risk
- **Budget vs. Committed vs. Actual** per department
- **Procurement plan vs. actual execution**
- **Pending approvals aging** (bottleneck detection)
- **Contract expiry and utilization report**
- **Supplier performance scorecard**
- **Three-way match exceptions report**
- **Full audit trail** per transaction (exportable)
- Export to PDF / Excel

---

## 19. 🔔 Notifications & Alerts

- Pending approval reminders (escalation on overdue)
- Overdue PO deliveries
- Budget threshold warnings (configurable: 70%, 90%)
- RFQ deadline alerts (to suppliers and procurement team)
- Contract renewal reminders (90 / 60 / 30 days)
- Expiring supplier licenses and certifications
- Invoice mismatch alerts
- Purchase return status updates
- New supplier quote submissions

Notification channels: in-app, email. (SMS / WhatsApp — Phase 2)

---

## 20. ⚙️ System Administration

- User management (invite, deactivate, assign roles)
- Department and cost-center setup
- Budget periods and limits configuration
- Procurement method workflow configuration
- Item / product catalog (standard items with pre-filled specs)
- Approval matrix configuration
- Currency and tax setup (multi-currency support)
- System branding per client (white-label)
- Template management
- Audit log viewer

---

## 21. 🔗 Integrations (Phase 2+)

| Category | Options |
|----------|---------|
| Accounting | QuickBooks, Xero, Sage |
| ERP | Odoo, SAP (via API) |
| Email | SMTP, SendGrid, Mailgun |
| SSO | Google Workspace, Microsoft 365 |
| Storage | AWS S3, Google Cloud Storage |
| Notifications | Twilio (SMS), WhatsApp Business API |

---

## Priority Summary

| Priority | Module |
|----------|--------|
| 🔴 High | Procurement Planning |
| 🔴 High | Budget Commitment / Encumbrance |
| 🔴 High | Contract Management |
| 🔴 High | Procurement Methods |
| 🟠 Medium | Supplier Portal |
| 🟠 Medium | Purchase Returns & Rejections |
| 🟠 Medium | Procurement Documents & Templates |
| 🟢 Recommended | Central Procurement Workspace |
| 🟢 Recommended | Explicit End-to-End Lifecycle |

---

*Vensure by Versaly — Vendor trust. Purchase certainty.*
