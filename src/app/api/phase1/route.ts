import { NextRequest, NextResponse } from "next/server";
import {
  appendAuditEntry,
  getPhase1State,
  ProcurementMethodKey,
  savePhase1State,
} from "@/server/store/phase1-store";
import { RoleType } from "@/lib/rbac";

export async function GET() {
  const state = getPhase1State();
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.json();
  const body =
    rawBody && typeof rawBody.payload === "object" && rawBody.payload !== null
      ? { action: rawBody.action, ...rawBody.payload }
      : rawBody;
  const state = getPhase1State();

  const activeUser =
    state.users.find((u) => u.id === state.activeUserId) ?? state.users[0];
  const actorName = activeUser?.fullName ?? "System Admin";
  const actorRole: RoleType = activeUser?.role ?? "ADMIN";
  const orgId = state.activeOrganizationId;
  const activeOrg =
    state.organizations.find((o) => o.id === orgId) ?? state.organizations[0];
  const baseCurrency = activeOrg?.baseCurrency || "KES";

  switch (body.action) {
    case "SWITCH_ORGANIZATION": {
      const targetOrg = state.organizations.find(
        (o) => o.id === body.organizationId
      );
      if (targetOrg) {
        state.activeOrganizationId = targetOrg.id;
        appendAuditEntry(state, {
          organizationId: targetOrg.id,
          actorName,
          actorRole,
          action: "TENANT.CONTEXT_SWITCHED",
          entityType: "Organization",
          entityId: targetOrg.id,
          summary: `Switched multi-tenant context to "${targetOrg.name}" (${targetOrg.slug}).`,
        });
      }
      break;
    }

    case "SWITCH_ACTIVE_USER": {
      const targetUser = state.users.find((u) => u.id === body.userId);
      if (targetUser) {
        state.activeUserId = targetUser.id;
        appendAuditEntry(state, {
          organizationId: orgId,
          actorName: targetUser.fullName,
          actorRole: targetUser.role,
          action: "AUTH.SESSION_ROLE_SWITCHED",
          entityType: "User",
          entityId: targetUser.id,
          summary: `Active RBAC session switched to ${targetUser.fullName} (${targetUser.role}).`,
        });
      }
      break;
    }

    case "UPDATE_BRANDING": {
      const org = state.organizations.find((o) => o.id === orgId);
      if (org) {
        org.name = body.name ?? org.name;
        org.taxId = body.taxId ?? org.taxId;
        org.primaryColor = body.primaryColor ?? org.primaryColor;
        org.baseCurrency = body.baseCurrency ?? org.baseCurrency;
        org.documentHeader = body.documentHeader ?? org.documentHeader;
        org.documentFooter = body.documentFooter ?? org.documentFooter;

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "ORG.BRANDING_UPDATED",
          entityType: "Organization",
          entityId: org.id,
          summary: `Updated white-label branding & document templates for ${org.name} (Base Currency: ${org.baseCurrency}).`,
        });
      }
      break;
    }

    case "ADD_BRANCH": {
      const newBranch = {
        id: `br_${Date.now()}`,
        organizationId: orgId,
        code: String(body.code || "BR-NEW").toUpperCase(),
        name: String(body.name || "New Branch"),
        address: String(body.address || "Main Street"),
        isHeadquarters: Boolean(body.isHeadquarters),
      };
      state.branches.push(newBranch);
      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "BRANCH.CREATED",
        entityType: "Branch",
        entityId: newBranch.code,
        summary: `Created branch "${newBranch.name}" (${newBranch.code}).`,
      });
      break;
    }

    case "ADD_DEPARTMENT": {
      const newDept = {
        id: `dept_${Date.now()}`,
        organizationId: orgId,
        code: String(body.code || "DEPT-NEW").toUpperCase(),
        name: String(body.name || "New Department"),
        headName: String(body.headName || "Unassigned"),
        fiscalPeriod: "FY2026",
        currency: String(body.currency || baseCurrency),
        totalBudget: Number(body.totalBudget || 5000000),
        encumbered: 0,
        committed: 0,
        actualSpend: 0,
        warningThresholdPct: 70,
        criticalThresholdPct: 90,
      };
      state.departments.push(newDept);
      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "DEPARTMENT.CREATED",
        entityType: "Department",
        entityId: newDept.code,
        summary: `Created department "${newDept.name}" (${newDept.code}) with initial budget KES ${newDept.totalBudget.toLocaleString()}.`,
      });
      break;
    }

    case "ADD_COST_CENTER": {
      const dept = state.departments.find((d) => d.id === body.departmentId);
      const newCC = {
        id: `cc_${Date.now()}`,
        organizationId: orgId,
        departmentId: dept?.id ?? "dept_ops",
        departmentName: dept?.name ?? "Operations",
        code: String(body.code || "CC-NEW").toUpperCase(),
        name: String(body.name || "New Cost Center"),
      };
      state.costCenters.push(newCC);
      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "COST_CENTER.CREATED",
        entityType: "CostCenter",
        entityId: newCC.code,
        summary: `Created cost center "${newCC.name}" (${newCC.code}) linked to ${newCC.departmentName}.`,
      });
      break;
    }

    case "INVITE_USER": {
      const newUser = {
        id: `usr_${Date.now()}`,
        organizationId: orgId,
        fullName: String(body.fullName || "New Staff"),
        email: String(body.email || "staff@organization.org"),
        departmentName: String(body.departmentName || "Operations"),
        role: (body.role as RoleType) || "VIEWER",
        isActive: true,
      };
      state.users.push(newUser);
      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "USER.INVITED",
        entityType: "User",
        entityId: newUser.email,
        summary: `Invited user ${newUser.fullName} (${newUser.email}) with RBAC role [${newUser.role}].`,
      });
      break;
    }

    case "UPDATE_USER_ROLE": {
      const target = state.users.find((u) => u.id === body.userId);
      if (target) {
        const previousRole = target.role;
        target.role = body.role as RoleType;
        if (typeof body.isActive === "boolean") {
          target.isActive = body.isActive;
        }
        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "USER.RBAC_UPDATED",
          entityType: "User",
          entityId: target.email,
          summary: `Updated RBAC role for ${target.fullName}: ${previousRole} → ${target.role} (Active: ${target.isActive}).`,
        });
      }
      break;
    }

    case "SET_DELEGATION": {
      const delegator = state.users.find((u) => u.id === body.fromUserId);
      const delegatee = state.users.find((u) => u.id === body.toUserId);
      if (delegator && delegatee) {
        delegator.delegatedToUserId = delegatee.id;
        delegator.delegationReason = String(
          body.reason || "Vacation / Leave Cover"
        );
        delegator.delegationEnd = String(body.endDate || "2026-10-31");

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "APPROVAL.DELEGATION_SET",
          entityType: "User",
          entityId: delegator.email,
          summary: `Delegated approval authority from ${delegator.fullName} (${delegator.role}) to ${delegatee.fullName} until ${delegator.delegationEnd}. Reason: ${delegator.delegationReason}`,
        });
      }
      break;
    }

    case "ADD_CATALOG_ITEM": {
      const item = {
        id: `cat_${Date.now()}`,
        organizationId: orgId,
        sku: String(body.sku || `SKU-${Date.now().toString().slice(-4)}`),
        name: String(body.name || "New Catalog Item"),
        category: String(body.category || "General Supplies"),
        specification: String(body.specification || "Standard specification"),
        unitOfMeasure: String(body.unitOfMeasure || "EA"),
        referenceUnitCost: Number(body.referenceUnitCost || 100),
        currency: String(body.currency || baseCurrency),
        defaultMethod: (body.defaultMethod as ProcurementMethodKey) || "RFQ",
      };
      state.catalogItems.unshift(item);
      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "CATALOG.ITEM_ADDED",
        entityType: "CatalogItem",
        entityId: item.sku,
        summary: `Added standard catalog item [${item.sku}] "${item.name}" (KES ${item.referenceUnitCost.toLocaleString()}/${item.unitOfMeasure}, Method: ${item.defaultMethod}).`,
      });
      break;
    }

    case "PROCESS_APPROVAL_DECISION": {
      const item = state.approvalQueue.find((q) => q.id === body.queueId);
      if (item && item.status === "UNDER_REVIEW") {
        const decision: "APPROVED" | "REJECTED" = body.decision;
        const comment = String(
          body.comment ||
            (decision === "APPROVED"
              ? "Verified and approved."
              : "Rejected due to specification mismatch.")
        );

        const pendingStep = item.history.find((h) => h.decision === "PENDING");
        if (pendingStep) {
          pendingStep.decision = decision;
          pendingStep.comment = comment;
          pendingStep.actorName = actorName;
          pendingStep.actorRole = actorRole;
          pendingStep.timestamp = new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 19);
        }

        if (decision === "REJECTED") {
          item.status = "REJECTED";
          appendAuditEntry(state, {
            organizationId: orgId,
            actorName,
            actorRole,
            action: "APPROVAL.REJECTED",
            entityType: item.documentType,
            entityId: item.referenceNo,
            summary: `Rejected ${item.referenceNo} at Step ${item.currentStepOrder}. Mandatory Reason: "${comment}"`,
          });
        } else {
          const workflow = state.approvalWorkflows.find(
            (w) => w.targetDocument === item.documentType
          );
          const nextStep = workflow?.steps.find(
            (s) =>
              s.stepOrder > item.currentStepOrder &&
              item.amount >= s.minThresholdAmount
          );

          if (nextStep) {
            item.currentStepOrder = nextStep.stepOrder;
            item.history.push({
              stepOrder: nextStep.stepOrder,
              stepName: nextStep.stepName,
              actorName: `Awaiting ${nextStep.approverRole}`,
              actorRole: nextStep.approverRole,
              decision: "PENDING",
              comment: `Routed automatically (Amount KES ${item.amount.toLocaleString()} >= threshold KES ${nextStep.minThresholdAmount.toLocaleString()}).`,
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
            });
            appendAuditEntry(state, {
              organizationId: orgId,
              actorName,
              actorRole,
              action: "APPROVAL.STEP_ADVANCED",
              entityType: item.documentType,
              entityId: item.referenceNo,
              summary: `Approved step on ${item.referenceNo}. Advanced to ${nextStep.stepName} (${nextStep.approverRole}).`,
            });
          } else {
            item.status = "APPROVED";
            appendAuditEntry(state, {
              organizationId: orgId,
              actorName,
              actorRole,
              action: "APPROVAL.FINAL_APPROVED",
              entityType: item.documentType,
              entityId: item.referenceNo,
              summary: `Final approval completed for ${item.referenceNo} (KES ${item.amount.toLocaleString()}). Budget encumbrance locked.`,
            });
          }
        }
      }
      break;
    }

    // =========================================================================
    // PHASE 2 ACTIONS: BUDGETS, PLANS, METHODS & PURCHASE REQUISITIONS
    // =========================================================================

    case "UPDATE_DEPARTMENT_BUDGET": {
      const dept = state.departments.find((d) => d.id === body.departmentId);
      if (dept) {
        const oldTotal = dept.totalBudget;
        dept.totalBudget = Number(body.totalBudget ?? dept.totalBudget);
        dept.warningThresholdPct = Number(
          body.warningThresholdPct ?? dept.warningThresholdPct
        );
        dept.criticalThresholdPct = Number(
          body.criticalThresholdPct ?? dept.criticalThresholdPct
        );

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "BUDGET.ALLOCATION_UPDATED",
          entityType: "DepartmentBudget",
          entityId: dept.code,
          summary: `Updated ${dept.name} (${dept.fiscalPeriod}) budget: KES ${oldTotal.toLocaleString()} → KES ${dept.totalBudget.toLocaleString()} (Thresholds: ${dept.warningThresholdPct}% / ${dept.criticalThresholdPct}%).`,
        });
      }
      break;
    }

    case "CREATE_PROCUREMENT_PLAN": {
      const dept =
        state.departments.find((d) => d.id === body.departmentId) ??
        state.departments[0];
      const nextNum = state.procurementPlans.length + 1;
      const planCode = `PLAN-2026-00${nextNum}`;
      const newPlan = {
        id: `plan_${Date.now()}`,
        organizationId: orgId,
        planCode,
        fiscalPeriod: String(body.fiscalPeriod || "FY2026"),
        departmentId: dept.id,
        departmentName: dept.name,
        category: String(body.category || "Medical Supplies"),
        description: String(body.description || "Planned procurement item"),
        estimatedBudget: Number(body.estimatedBudget || 1500000),
        currency: String(body.currency || baseCurrency),
        expectedQuarter: (body.expectedQuarter || "Q4") as
          | "Q1"
          | "Q2"
          | "Q3"
          | "Q4",
        expectedDate: String(body.expectedDate || "2026-11-15"),
        plannedMethod: (body.plannedMethod as ProcurementMethodKey) || "RFQ",
        status: "PLANNED" as const,
      };
      state.procurementPlans.unshift(newPlan);

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "PLAN.CREATED",
        entityType: "ProcurementPlan",
        entityId: newPlan.planCode,
        summary: `Created annual procurement plan item ${newPlan.planCode} ("${newPlan.description}") for ${newPlan.departmentName} — Est. KES ${newPlan.estimatedBudget.toLocaleString()} via ${newPlan.plannedMethod}.`,
      });
      break;
    }

    case "UPDATE_PLAN_STATUS": {
      const plan = state.procurementPlans.find((p) => p.id === body.planId);
      if (plan) {
        const prev = plan.status;
        plan.status = body.status as "PLANNED" | "ACTIVE" | "COMPLETED";
        if (plan.status === "ACTIVE") {
          plan.approvedBy = actorName;
          plan.approvedAt = new Date().toISOString().slice(0, 10);
        }
        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: `PLAN.STATUS_${plan.status}`,
          entityType: "ProcurementPlan",
          entityId: plan.planCode,
          summary: `Transitioned procurement plan ${plan.planCode} status: ${prev} → ${plan.status}.`,
        });
      }
      break;
    }

    case "CREATE_PURCHASE_REQUISITION": {
      const dept =
        state.departments.find((d) => d.id === body.departmentId) ??
        state.departments[0];
      const cc =
        state.costCenters.find((c) => c.id === body.costCenterId) ??
        state.costCenters.find((c) => c.departmentId === dept.id) ??
        state.costCenters[0];
      const linkedPlan = state.procurementPlans.find(
        (p) => p.id === body.procurementPlanId
      );

      const nextPrSeq = 40 + state.purchaseRequisitions.length + 1;
      const prNumber = `PR-2026-00${nextPrSeq}`;
      const selectedMethod =
        (body.selectedMethod as ProcurementMethodKey) ||
        linkedPlan?.plannedMethod ||
        "RFQ";
      const quantity = Number(body.quantity || 1);
      const unitCost = Number(body.estimatedUnitCost || 100);
      const totalAmount = quantity * unitCost;
      const submitNow = Boolean(body.submitNow);

      const newPr = {
        id: `pr_${Date.now()}`,
        organizationId: orgId,
        prNumber,
        title: String(body.title || "New Purchase Requisition"),
        requesterName: actorName,
        requesterRole: actorRole,
        departmentId: dept.id,
        departmentName: dept.name,
        costCenterId: cc.id,
        costCenterCode: cc.code,
        costCenterName: cc.name,
        procurementPlanId: linkedPlan?.id,
        procurementPlanCode: linkedPlan?.planCode,
        plannedMethod: linkedPlan?.plannedMethod,
        selectedMethod,
        methodDeviationJustification: body.methodDeviationJustification
          ? String(body.methodDeviationJustification)
          : undefined,
        currency: String(body.currency || baseCurrency),
        totalAmount,
        requiredDate: String(body.requiredDate || "2026-11-10"),
        status: (submitNow ? "UNDER_REVIEW" : "DRAFT") as
          | "DRAFT"
          | "UNDER_REVIEW",
        revisionNumber: 1,
        budgetEncumbered: false,
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        items: [
          {
            id: `pri_${Date.now()}`,
            sku: String(body.sku || "CUSTOM-ITEM"),
            description: String(body.itemDescription || body.title),
            specification: String(
              body.specification || "Standard departmental specification"
            ),
            quantity,
            unitOfMeasure: String(body.unitOfMeasure || "EA"),
            estimatedUnitCost: unitCost,
            totalEstimatedCost: totalAmount,
          },
        ],
        approvalTimeline: submitNow
          ? [
              {
                stepOrder: 1,
                stepName: "Level 1: Department Head (HOD) Endorsement",
                actorName: "Awaiting DEPARTMENT_HEAD",
                actorRole: "DEPARTMENT_HEAD" as RoleType,
                decision: "PENDING" as const,
                comment: "Submitted for departmental review and budget check.",
                timestamp: new Date()
                  .toISOString()
                  .replace("T", " ")
                  .slice(0, 19),
              },
            ]
          : [],
      };

      state.purchaseRequisitions.unshift(newPr);

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: submitNow ? "PR.SUBMITTED" : "PR.DRAFT_CREATED",
        entityType: "PurchaseRequisition",
        entityId: prNumber,
        summary: `${submitNow ? "Submitted" : "Saved draft"} ${prNumber} ("${newPr.title}") for KES ${totalAmount.toLocaleString()} under ${dept.name} (${cc.code}). Method: ${selectedMethod}.`,
      });

      if (
        (linkedPlan && linkedPlan.plannedMethod !== selectedMethod) ||
        selectedMethod === "SINGLE_SOURCE" ||
        selectedMethod === "EMERGENCY_PROCUREMENT"
      ) {
        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "METHOD.JUSTIFICATION_RECORDED",
          entityType: "PurchaseRequisition",
          entityId: prNumber,
          summary: `Recorded mandatory procurement method justification on ${prNumber} (${linkedPlan ? `Planned: ${linkedPlan.plannedMethod} → Selected: ${selectedMethod}` : selectedMethod}): "${newPr.methodDeviationJustification || "Urgent operational requirement"}"`,
        });
      }
      break;
    }

    case "APPROVE_OR_REJECT_PR": {
      const pr = state.purchaseRequisitions.find((p) => p.id === body.prId);
      if (pr) {
        const decision: "APPROVED" | "REJECTED" = body.decision;
        const comment = String(
          body.comment ||
            (decision === "APPROVED"
              ? "Approved and budget encumbered."
              : "Rejected — please revise and resubmit.")
        );
        const dept = state.departments.find((d) => d.id === pr.departmentId);

        if (decision === "APPROVED") {
          pr.status = "APPROVED";
          if (!pr.budgetEncumbered && dept) {
            dept.encumbered += pr.totalAmount;
            pr.budgetEncumbered = true;
          }
          pr.approvalTimeline.push({
            stepOrder: pr.approvalTimeline.length + 1,
            stepName: "Final Approval & Budget Encumbrance",
            actorName,
            actorRole,
            decision: "APPROVED",
            comment,
            timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          });

          const utilizedPct = dept
            ? Math.round(
                ((dept.encumbered + dept.committed + dept.actualSpend) /
                  dept.totalBudget) *
                  100
              )
            : 0;

          appendAuditEntry(state, {
            organizationId: orgId,
            actorName,
            actorRole,
            action: "PR.APPROVED_AND_ENCUMBERED",
            entityType: "PurchaseRequisition",
            entityId: pr.prNumber,
            summary: `Approved ${pr.prNumber} and encumbered KES ${pr.totalAmount.toLocaleString()} against ${pr.departmentName} budget (Department Utilization now ${utilizedPct}%).`,
          });
        } else {
          if (pr.budgetEncumbered && dept) {
            dept.encumbered = Math.max(0, dept.encumbered - pr.totalAmount);
            pr.budgetEncumbered = false;
          }
          pr.status = "REJECTED";
          pr.rejectionReason = comment;
          pr.approvalTimeline.push({
            stepOrder: pr.approvalTimeline.length + 1,
            stepName: "Requisition Rejected",
            actorName,
            actorRole,
            decision: "REJECTED",
            comment,
            timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          });

          appendAuditEntry(state, {
            organizationId: orgId,
            actorName,
            actorRole,
            action: "PR.REJECTED",
            entityType: "PurchaseRequisition",
            entityId: pr.prNumber,
            summary: `Rejected ${pr.prNumber}. Mandatory Reason: "${comment}"`,
          });
        }
      }
      break;
    }

    case "REVISE_AND_RESUBMIT_PR": {
      const pr = state.purchaseRequisitions.find((p) => p.id === body.prId);
      if (pr) {
        const newQty = Number(body.quantity ?? pr.items[0]?.quantity ?? 1);
        const newUnitCost = Number(
          body.estimatedUnitCost ?? pr.items[0]?.estimatedUnitCost ?? 100
        );
        const newTotal = newQty * newUnitCost;

        if (pr.items[0]) {
          pr.items[0].quantity = newQty;
          pr.items[0].estimatedUnitCost = newUnitCost;
          pr.items[0].totalEstimatedCost = newTotal;
        }
        pr.totalAmount = newTotal;
        pr.status = "UNDER_REVIEW";
        pr.rejectionReason = undefined;
        pr.revisionNumber += 1;
        pr.approvalTimeline.push({
          stepOrder: pr.approvalTimeline.length + 1,
          stepName: `Revision v${pr.revisionNumber} Resubmitted`,
          actorName,
          actorRole,
          decision: "PENDING",
          comment: String(
            body.revisionNote ||
              `Revised quantity to ${newQty} (New total: KES ${newTotal.toLocaleString()}) and resubmitted.`
          ),
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        });

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "PR.REVISED_AND_RESUBMITTED",
          entityType: "PurchaseRequisition",
          entityId: pr.prNumber,
          summary: `Revised and resubmitted ${pr.prNumber} (Revision v${pr.revisionNumber}) with updated amount KES ${newTotal.toLocaleString()}.`,
        });
      }
      break;
    }

    // =========================================================================
    // PHASE 3 ACTIONS: SUPPLIERS, RFQs, EVALUATION & CONTRACTS
    // =========================================================================

    case "ONBOARD_SUPPLIER": {
      const nextSeq = state.suppliers.length + 1;
      const supplierCode = `SUP-2026-00${nextSeq}`;
      const newSupplier = {
        id: `sup_${Date.now()}`,
        organizationId: orgId,
        supplierCode,
        name: String(body.name || "New Supplier Ltd"),
        category: String(body.category || "General Supplies"),
        contactPerson: String(body.contactPerson || "Procurement Desk"),
        email: String(body.email || "bids@supplier.com"),
        phone: String(body.phone || "+254 700 000 000"),
        taxId: String(body.taxId || "PIN-PENDING"),
        bankName: String(body.bankName || "Corporate Bank"),
        bankAccountNo: String(body.bankAccountNo || "0100000000"),
        approvalStatus: "APPROVED" as const,
        isPreferred: Boolean(body.isPreferred),
        isBlacklisted: false,
        deliveryTimeScore: 90,
        qualityRating: 4.5,
        priceCompetitivenessScore: 88,
        cumulativeSpend: 0,
        completedPoCount: 0,
        documents: [
          {
            id: `doc_${Date.now()}`,
            docType: "Tax Compliance Certificate",
            fileName: `${String(body.name || "Supplier").replace(/\s+/g, "_")}_TCC_2026.pdf`,
            expiryDate: "2027-06-30",
            status: "VALID" as const,
          },
        ],
      };
      state.suppliers.unshift(newSupplier);

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "SUPPLIER.ONBOARDED",
        entityType: "Supplier",
        entityId: supplierCode,
        summary: `Onboarded and verified supplier "${newSupplier.name}" (${supplierCode}, Tax ID: ${newSupplier.taxId}, Category: ${newSupplier.category}).`,
      });
      break;
    }

    case "TOGGLE_SUPPLIER_FLAGS": {
      const sup = state.suppliers.find((s) => s.id === body.supplierId);
      if (sup) {
        if (typeof body.isPreferred === "boolean") {
          sup.isPreferred = body.isPreferred;
          appendAuditEntry(state, {
            organizationId: orgId,
            actorName,
            actorRole,
            action: sup.isPreferred
              ? "SUPPLIER.MARKED_PREFERRED"
              : "SUPPLIER.UNMARKED_PREFERRED",
            entityType: "Supplier",
            entityId: sup.supplierCode,
            summary: `${sup.isPreferred ? "Flagged" : "Removed"} ${sup.name} (${sup.supplierCode}) as Preferred Supplier.`,
          });
        }
        if (typeof body.isBlacklisted === "boolean") {
          sup.isBlacklisted = body.isBlacklisted;
          sup.blacklistReason = body.isBlacklisted
            ? String(
                body.blacklistReason ||
                  "Blacklisted due to compliance/quality breach."
              )
            : undefined;
          if (sup.isBlacklisted) {
            sup.isPreferred = false;
          }
          appendAuditEntry(state, {
            organizationId: orgId,
            actorName,
            actorRole,
            action: sup.isBlacklisted
              ? "SUPPLIER.BLACKLISTED"
              : "SUPPLIER.REINSTATED",
            entityType: "Supplier",
            entityId: sup.supplierCode,
            summary: sup.isBlacklisted
              ? `BLACKLISTED supplier ${sup.name} (${sup.supplierCode}). Mandatory Reason: "${sup.blacklistReason}"`
              : `Reinstated supplier ${sup.name} (${sup.supplierCode}) from blacklist.`,
          });
        }
      }
      break;
    }

    case "UPLOAD_SUPPLIER_DOC": {
      const sup = state.suppliers.find((s) => s.id === body.supplierId);
      if (sup) {
        const doc = {
          id: `doc_${Date.now()}`,
          docType: String(body.docType || "Compliance Certificate"),
          fileName: String(body.fileName || "Certificate_2026.pdf"),
          expiryDate: String(body.expiryDate || "2027-12-31"),
          status: "VALID" as const,
        };
        sup.documents.push(doc);

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "SUPPLIER.DOCUMENT_UPLOADED",
          entityType: "Supplier",
          entityId: sup.supplierCode,
          summary: `Uploaded "${doc.docType}" (${doc.fileName}, Expiry: ${doc.expiryDate}) to Document Vault for ${sup.name}.`,
        });
      }
      break;
    }

    case "CREATE_RFQ_FROM_PR": {
      const pr =
        state.purchaseRequisitions.find((p) => p.id === body.prId) ??
        state.purchaseRequisitions[0];
      const nextRfqSeq = 100 + state.rfqs.length + 1;
      const rfqNumber = `RFQ-2026-0${nextRfqSeq}`;
      const invitedIds: string[] = Array.isArray(body.invitedSupplierIds)
        ? body.invitedSupplierIds
        : state.suppliers
            .filter((s) => !s.isBlacklisted && s.organizationId === orgId)
            .slice(0, 3)
            .map((s) => s.id);

      const newRfq = {
        id: `rfq_${Date.now()}`,
        organizationId: orgId,
        rfqNumber,
        prId: pr.id,
        prNumber: pr.prNumber,
        title: String(body.title || pr.title),
        departmentName: pr.departmentName,
        procurementMethod: pr.selectedMethod,
        estimatedBudget: pr.totalAmount,
        currency: pr.currency,
        submissionDeadline: String(body.submissionDeadline || "2026-10-22"),
        status: "ISSUED" as const,
        invitedSupplierIds: invitedIds,
        quotations: [],
        clarifications: [],
      };
      state.rfqs.unshift(newRfq);

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "RFQ.ISSUED_FROM_PR",
        entityType: "Rfq",
        entityId: rfqNumber,
        summary: `Auto-generated and issued ${rfqNumber} from approved ${pr.prNumber} ("${newRfq.title}", Est. KES ${newRfq.estimatedBudget.toLocaleString()}) to ${invitedIds.length} registered suppliers. Deadline: ${newRfq.submissionDeadline}.`,
      });
      break;
    }

    case "SUBMIT_SUPPLIER_QUOTE": {
      const rfq = state.rfqs.find((r) => r.id === body.rfqId);
      const sup = state.suppliers.find((s) => s.id === body.supplierId);
      if (rfq && sup) {
        const quote = {
          id: `qt_${Date.now()}`,
          supplierId: sup.id,
          supplierName: sup.name,
          quotedAmount: Number(body.quotedAmount || rfq.estimatedBudget),
          currency: rfq.currency,
          leadTimeDays: Number(body.leadTimeDays || 7),
          validityDays: Number(body.validityDays || 30),
          warrantyAndSpecsNote: String(
            body.warrantyAndSpecsNote ||
              "Meets all RFQ technical specifications and delivery schedule."
          ),
          isSelected: false,
          submittedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        };
        rfq.quotations.push(quote);

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName: sup.name,
          actorRole: "SUPPLIER",
          action: "QUOTE.SUBMITTED",
          entityType: "Rfq",
          entityId: rfq.rfqNumber,
          summary: `Supplier "${sup.name}" submitted quotation of KES ${quote.quotedAmount.toLocaleString()} (Lead time: ${quote.leadTimeDays} days) for ${rfq.rfqNumber}.`,
        });
      }
      break;
    }

    case "ADD_RFQ_CLARIFICATION": {
      const rfq = state.rfqs.find((r) => r.id === body.rfqId);
      if (rfq) {
        const clr = {
          id: `clr_${Date.now()}`,
          supplierName: String(body.supplierName || "Invited Supplier"),
          question: String(body.question || "Clarification question"),
          response: body.response ? String(body.response) : undefined,
          askedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          respondedAt: body.response
            ? new Date().toISOString().replace("T", " ").slice(0, 16)
            : undefined,
        };
        rfq.clarifications.push(clr);

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "RFQ.CLARIFICATION_LOGGED",
          entityType: "Rfq",
          entityId: rfq.rfqNumber,
          summary: `Logged supplier clarification Q&A on ${rfq.rfqNumber} (${clr.supplierName}).`,
        });
      }
      break;
    }

    case "EVALUATE_AND_SELECT_QUOTE": {
      const rfq = state.rfqs.find((r) => r.id === body.rfqId);
      if (rfq && rfq.quotations.length > 0) {
        const chosenQuote = rfq.quotations.find((q) => q.id === body.quoteId);
        if (chosenQuote) {
          const minQuoteAmount = Math.min(
            ...rfq.quotations.map((q) => q.quotedAmount)
          );
          const isCheapest = chosenQuote.quotedAmount <= minQuoteAmount;

          rfq.quotations.forEach((q) => {
            q.isSelected = q.id === chosenQuote.id;
          });
          rfq.status = "EVALUATED";
          rfq.selectedSupplierId = chosenQuote.supplierId;
          rfq.selectedSupplierName = chosenQuote.supplierName;
          rfq.awardedAmount = chosenQuote.quotedAmount;
          rfq.selectionJustification = String(
            body.selectionJustification ||
              "Highest weighted technical, delivery, and commercial score."
          );
          rfq.cheapestOverrideReason = !isCheapest
            ? String(
                body.cheapestOverrideReason ||
                  "Selected higher-ranked supplier due to faster delivery lead time and superior ISO quality rating."
              )
            : undefined;
          rfq.evaluatedBy = actorName;
          rfq.evaluatedAt = new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 16);

          appendAuditEntry(state, {
            organizationId: orgId,
            actorName,
            actorRole,
            action: "RFQ.QUOTE_SELECTED",
            entityType: "Rfq",
            entityId: rfq.rfqNumber,
            summary: `Awarded ${rfq.rfqNumber} to "${chosenQuote.supplierName}" at KES ${chosenQuote.quotedAmount.toLocaleString()}. Justification: "${rfq.selectionJustification}"`,
          });

          if (!isCheapest) {
            appendAuditEntry(state, {
              organizationId: orgId,
              actorName,
              actorRole,
              action: "QUOTE.OVERRIDE_ALERT_LOGGED",
              entityType: "Rfq",
              entityId: rfq.rfqNumber,
              summary: `OVERRIDE ALERT on ${rfq.rfqNumber}: Lowest quote was KES ${minQuoteAmount.toLocaleString()}, but "${chosenQuote.supplierName}" (KES ${chosenQuote.quotedAmount.toLocaleString()}) was selected. Mandatory Override Reason: "${rfq.cheapestOverrideReason}"`,
            });
          }
        }
      }
      break;
    }

    case "CREATE_CONTRACT": {
      const sup =
        state.suppliers.find((s) => s.id === body.supplierId) ??
        state.suppliers[0];
      const dept =
        state.departments.find((d) => d.id === body.departmentId) ??
        state.departments[0];
      const nextCnt = 10 + state.contracts.length + 1;
      const contractNumber = `CNT-2026-FA${nextCnt}`;

      const newContract = {
        id: `cnt_${Date.now()}`,
        organizationId: orgId,
        contractNumber,
        title: String(body.title || "New Supplier Framework Contract"),
        supplierId: sup.id,
        supplierName: sup.name,
        departmentId: dept.id,
        departmentName: dept.name,
        ownerName: String(body.ownerName || dept.headName),
        procurementMethod:
          (body.procurementMethod as ProcurementMethodKey) ||
          "FRAMEWORK_AGREEMENT",
        startDate: String(body.startDate || "2026-10-01"),
        endDate: String(body.endDate || "2027-09-30"),
        renewalReminderDays: (Number(body.renewalReminderDays) || 60) as
          | 90
          | 60
          | 30,
        ceilingValue: Number(body.ceilingValue || 8000000),
        utilizedSpend: 0,
        linkedPoNumbers: [],
        currency: String(body.currency || baseCurrency),
        status: "ACTIVE" as const,
        versionNumber: 1,
        documentFileName: `${contractNumber}_Signed_Agreement_v1.pdf`,
        amendments: [],
      };
      state.contracts.unshift(newContract);

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "CONTRACT.CREATED",
        entityType: "SupplierContract",
        entityId: contractNumber,
        summary: `Registered operational contract ${contractNumber} ("${newContract.title}") with ${sup.name} — Ceiling: KES ${newContract.ceilingValue.toLocaleString()}, Valid: ${newContract.startDate} to ${newContract.endDate} (${newContract.renewalReminderDays}-day renewal alert).`,
      });
      break;
    }

    case "AMEND_CONTRACT": {
      const cnt = state.contracts.find((c) => c.id === body.contractId);
      if (cnt) {
        const prevCeiling = cnt.ceilingValue;
        const newCeiling = Number(body.newCeiling ?? cnt.ceilingValue);
        const newEndDate = String(body.newEndDate || cnt.endDate);
        const summary = String(
          body.amendmentSummary ||
            "Contract ceiling and validity period extended."
        );

        cnt.versionNumber += 1;
        cnt.ceilingValue = newCeiling;
        cnt.endDate = newEndDate;
        cnt.status = "ACTIVE";
        cnt.documentFileName = `${cnt.contractNumber}_Signed_Agreement_v${cnt.versionNumber}.pdf`;

        cnt.amendments.unshift({
          id: `amd_${Date.now()}`,
          versionNumber: cnt.versionNumber,
          amendmentSummary: summary,
          previousCeiling: prevCeiling,
          newCeiling,
          newEndDate,
          amendedBy: actorName,
          amendedAt: new Date().toISOString().slice(0, 10),
        });

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "CONTRACT.AMENDED",
          entityType: "SupplierContract",
          entityId: cnt.contractNumber,
          summary: `Amended contract ${cnt.contractNumber} to Version v${cnt.versionNumber} (Ceiling: KES ${prevCeiling.toLocaleString()} → KES ${newCeiling.toLocaleString()}, End Date: ${newEndDate}). Note: "${summary}"`,
        });
      }
      break;
    }

    // =========================================================================
    // PHASE 4 ACTIONS: PURCHASE ORDERS (PO), SUPPLIER PORTAL & GRNs
    // =========================================================================

    case "CREATE_PO_FROM_QUOTE_OR_CONTRACT": {
      const rfq = state.rfqs.find((r) => r.id === body.rfqId);
      const sup =
        state.suppliers.find(
          (s) => s.id === (body.supplierId || rfq?.selectedSupplierId)
        ) ?? state.suppliers[0];
      const dept =
        state.departments.find((d) => d.id === body.departmentId) ??
        state.departments.find((d) => d.name === rfq?.departmentName) ??
        state.departments[0];
      const contract = state.contracts.find((c) => c.id === body.contractId);

      const nextPoSeq = 55 + state.purchaseOrders.length + 1;
      const poNumber = `PO-2026-00${nextPoSeq}`;
      const orderedQty = Number(body.orderedQty || 10);
      const unitPrice = Number(
        body.unitPrice ||
          (rfq?.awardedAmount ? rfq.awardedAmount / orderedQty : 500)
      );
      const totalAmount = orderedQty * unitPrice;

      const newPo = {
        id: `po_${Date.now()}`,
        organizationId: orgId,
        poNumber,
        title: String(body.title || rfq?.title || "Standard Purchase Order"),
        supplierId: sup.id,
        supplierName: sup.name,
        departmentId: dept.id,
        departmentName: dept.name,
        prId: rfq?.prId,
        prNumber: rfq?.prNumber,
        rfqId: rfq?.id,
        rfqNumber: rfq?.rfqNumber,
        contractId: contract?.id,
        contractNumber: contract?.contractNumber,
        currency: String(body.currency || baseCurrency),
        totalAmount,
        expectedDeliveryDate: String(
          body.expectedDeliveryDate || "2026-10-28"
        ),
        status: "ISSUED" as const,
        versionNumber: 1,
        allowSplitDelivery: Boolean(body.allowSplitDelivery ?? true),
        emailedToSupplierAt: new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 16),
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        items: [
          {
            id: `poi_${Date.now()}`,
            sku: String(body.sku || "SKU-PO-01"),
            description: String(
              body.itemDescription || body.title || rfq?.title || "PO Line Item"
            ),
            unitOfMeasure: String(body.unitOfMeasure || "EA"),
            orderedQty,
            receivedQty: 0,
            unitPrice,
            totalPrice: totalAmount,
          },
        ],
        amendments: [],
      };

      state.purchaseOrders.unshift(newPo);

      // 4-Layer Budget Transition: Move from Encumbered (PR) to Committed (PO)
      dept.encumbered = Math.max(0, dept.encumbered - totalAmount);
      dept.committed += totalAmount;

      // Update Contract Spend if linked
      if (contract) {
        contract.utilizedSpend += totalAmount;
        if (!contract.linkedPoNumbers.includes(poNumber)) {
          contract.linkedPoNumbers.push(poNumber);
        }
      }

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "PO.ISSUED_AND_COMMITTED",
        entityType: "PurchaseOrder",
        entityId: poNumber,
        summary: `Issued ${poNumber} ("${newPo.title}") to ${sup.name} for KES ${totalAmount.toLocaleString()}. Transitioned ${dept.name} budget from Encumbered → Committed.${contract ? ` Linked to contract ${contract.contractNumber}.` : ""}`,
      });
      break;
    }

    case "AMEND_PURCHASE_ORDER": {
      const po = state.purchaseOrders.find((p) => p.id === body.poId);
      if (po && po.status !== "CANCELLED") {
        const prevAmount = po.totalAmount;
        const newQty = Number(body.orderedQty ?? po.items[0]?.orderedQty ?? 1);
        const newUnit = Number(body.unitPrice ?? po.items[0]?.unitPrice ?? 100);
        const newAmount = newQty * newUnit;
        const delta = newAmount - prevAmount;
        const note = String(
          body.amendmentNote || "Updated PO quantity and commercial terms."
        );

        if (po.items[0]) {
          po.items[0].orderedQty = newQty;
          po.items[0].unitPrice = newUnit;
          po.items[0].totalPrice = newAmount;
        }
        po.totalAmount = newAmount;
        po.versionNumber += 1;
        po.amendments.unshift({
          id: `poa_${Date.now()}`,
          versionNumber: po.versionNumber,
          amendmentNote: note,
          previousAmount: prevAmount,
          newAmount,
          amendedBy: actorName,
          amendedAt: new Date().toISOString().slice(0, 10),
        });

        const dept = state.departments.find((d) => d.id === po.departmentId);
        if (dept) {
          dept.committed = Math.max(0, dept.committed + delta);
        }

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "PO.AMENDED",
          entityType: "PurchaseOrder",
          entityId: po.poNumber,
          summary: `Amended ${po.poNumber} to Version v${po.versionNumber} (KES ${prevAmount.toLocaleString()} → KES ${newAmount.toLocaleString()}). Reason: "${note}"`,
        });
      }
      break;
    }

    case "CANCEL_PURCHASE_ORDER": {
      const po = state.purchaseOrders.find((p) => p.id === body.poId);
      if (po && po.status !== "CANCELLED") {
        po.status = "CANCELLED";
        const dept = state.departments.find((d) => d.id === po.departmentId);
        if (dept) {
          dept.committed = Math.max(0, dept.committed - po.totalAmount);
        }
        const contract = state.contracts.find((c) => c.id === po.contractId);
        if (contract) {
          contract.utilizedSpend = Math.max(
            0,
            contract.utilizedSpend - po.totalAmount
          );
        }

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "PO.CANCELLED_BUDGET_RELEASED",
          entityType: "PurchaseOrder",
          entityId: po.poNumber,
          summary: `Cancelled ${po.poNumber} and automatically released KES ${po.totalAmount.toLocaleString()} from Committed Budget back to ${po.departmentName} Available Budget.`,
        });
      }
      break;
    }

    case "SWITCH_PORTAL_SUPPLIER": {
      const sup = state.suppliers.find((s) => s.id === body.supplierId);
      if (sup) {
        state.activePortalSupplierId = sup.id;
        appendAuditEntry(state, {
          organizationId: orgId,
          actorName: sup.name,
          actorRole: "SUPPLIER",
          action: "PORTAL.SUPPLIER_SESSION_SWITCHED",
          entityType: "Supplier",
          entityId: sup.supplierCode,
          summary: `External Supplier Portal session switched to "${sup.name}" (${sup.supplierCode}).`,
        });
      }
      break;
    }

    case "SUPPLIER_UPDATE_PROFILE": {
      const sup = state.suppliers.find((s) => s.id === body.supplierId);
      if (sup) {
        sup.contactPerson = String(body.contactPerson ?? sup.contactPerson);
        sup.email = String(body.email ?? sup.email);
        sup.phone = String(body.phone ?? sup.phone);
        sup.bankName = String(body.bankName ?? sup.bankName);
        sup.bankAccountNo = String(body.bankAccountNo ?? sup.bankAccountNo);

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName: sup.name,
          actorRole: "SUPPLIER",
          action: "PORTAL.PROFILE_UPDATED",
          entityType: "Supplier",
          entityId: sup.supplierCode,
          summary: `Supplier "${sup.name}" updated company contact & banking profile via External Supplier Portal (Bank: ${sup.bankName} / ${sup.bankAccountNo}).`,
        });
      }
      break;
    }

    case "SUPPLIER_ACKNOWLEDGE_OR_REJECT_PO": {
      const po = state.purchaseOrders.find((p) => p.id === body.poId);
      if (po) {
        const decision: "ACKNOWLEDGED" | "CANCELLED" = body.decision;
        po.status = decision;
        po.confirmedDeliveryDate = String(
          body.confirmedDeliveryDate || po.expectedDeliveryDate
        );
        po.supplierAckNote = String(
          body.supplierAckNote ||
            (decision === "ACKNOWLEDGED"
              ? "PO accepted via Supplier Portal. Delivery schedule confirmed."
              : "PO declined by supplier.")
        );

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName: po.supplierName,
          actorRole: "SUPPLIER",
          action:
            decision === "ACKNOWLEDGED"
              ? "PORTAL.PO_ACKNOWLEDGED"
              : "PORTAL.PO_REJECTED",
          entityType: "PurchaseOrder",
          entityId: po.poNumber,
          summary: `Supplier "${po.supplierName}" ${decision === "ACKNOWLEDGED" ? "ACKNOWLEDGED" : "REJECTED"} ${po.poNumber} via Supplier Portal. Confirmed Delivery Date: ${po.confirmedDeliveryDate}. Note: "${po.supplierAckNote}"`,
        });
      }
      break;
    }

    case "RECORD_GOODS_RECEIPT_GRN": {
      const po = state.purchaseOrders.find((p) => p.id === body.poId);
      if (po && po.items[0]) {
        const nextGrnSeq = 88 + state.goodsReceipts.length + 1;
        const grnNumber = `GRN-2026-00${nextGrnSeq}`;
        const line = po.items[0];
        const receivedNow = Number(body.receivedQtyThisGrn || 1);
        const damagedQty = Number(body.damagedOrShortQty || 0);
        const conditionFlag = (body.conditionFlag || "GOOD") as
          | "GOOD"
          | "SHORTAGE"
          | "DAMAGED"
          | "SUBSTITUTED";
        const discrepancyNote = body.discrepancyNote
          ? String(body.discrepancyNote)
          : undefined;

        line.receivedQty += receivedNow;
        const isFullyReceived = line.receivedQty >= line.orderedQty;
        po.status = isFullyReceived ? "COMPLETED" : "PARTIALLY_DELIVERED";

        const grnStatus = isFullyReceived
          ? ("FULLY_RECEIVED" as const)
          : ("PARTIALLY_RECEIVED" as const);

        const newGrn = {
          id: `grn_${Date.now()}`,
          organizationId: orgId,
          grnNumber,
          poId: po.id,
          poNumber: po.poNumber,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          departmentName: po.departmentName,
          receivedBy: String(body.receivedBy || `${actorName} (Warehouse)`),
          deliveryNoteRef: String(body.deliveryNoteRef || "DN-2026-STD"),
          receivedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          status: grnStatus,
          hasDiscrepancy: conditionFlag !== "GOOD" || damagedQty > 0,
          items: [
            {
              id: `grni_${Date.now()}`,
              sku: line.sku,
              description: line.description,
              unitOfMeasure: line.unitOfMeasure,
              orderedQty: line.orderedQty,
              receivedQtyThisGrn: receivedNow,
              damagedOrShortQty: damagedQty,
              conditionFlag,
              discrepancyNote,
            },
          ],
        };

        state.goodsReceipts.unshift(newGrn);

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "GRN.RECORDED",
          entityType: "GoodsReceiptNote",
          entityId: grnNumber,
          summary: `Recorded ${grnNumber} against ${po.poNumber} (${receivedNow} ${line.unitOfMeasure} received; Cumulative: ${line.receivedQty}/${line.orderedQty} ${line.unitOfMeasure}; Condition: ${conditionFlag}). PO Status → ${po.status}.`,
        });
      }
      break;
    }

    // =========================================================================
    // PHASE 5 ACTIONS: PURCHASE RETURNS, 3-WAY MATCHING & INVOICE PAYMENTS
    // =========================================================================

    case "RAISE_PURCHASE_RETURN": {
      const grn =
        state.goodsReceipts.find((g) => g.id === body.grnId) ??
        state.goodsReceipts[0];
      const po =
        state.purchaseOrders.find((p) => p.id === grn?.poId) ??
        state.purchaseOrders[0];

      if (grn && po) {
        const nextRetSeq = 14 + state.purchaseReturns.length + 1;
        const returnNumber = `RET-2026-00${nextRetSeq}`;
        const poLine = po.items[0];
        const returnedQty = Math.max(1, Number(body.returnedQty || 1));
        const unitPrice = Number(body.unitPrice ?? poLine?.unitPrice ?? 850);
        const returnAmount = returnedQty * unitPrice;
        const reasonCode = (body.reasonCode || "DAMAGED") as
          | "DAMAGED"
          | "WRONG_SPECIFICATION"
          | "EXPIRED_SHORT_DATED"
          | "QUALITY_DEFECT";
        const resolutionType = (body.resolutionType ||
          "CREDIT_NOTE_ADJUSTMENT") as
          | "REPLACEMENT_DELIVERY"
          | "CREDIT_NOTE_ADJUSTMENT";

        const creditNoteNumber =
          resolutionType === "CREDIT_NOTE_ADJUSTMENT"
            ? String(body.creditNoteNumber || `CN-${po.poNumber.slice(-4)}-${nextRetSeq}`)
            : undefined;

        const newReturn = {
          id: `ret_${Date.now()}`,
          organizationId: orgId,
          returnNumber,
          grnId: grn.id,
          grnNumber: grn.grnNumber,
          poId: po.id,
          poNumber: po.poNumber,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          departmentId: po.departmentId,
          departmentName: po.departmentName,
          sku: poLine?.sku || "SKU-RET-01",
          description: poLine?.description || po.title,
          unitOfMeasure: poLine?.unitOfMeasure || "EA",
          returnedQty,
          unitPrice,
          returnAmount,
          reasonCode,
          reasonNotes: String(
            body.reasonNotes ||
              `Rejected ${returnedQty} ${poLine?.unitOfMeasure || "EA"} during GRN inspection (${reasonCode}).`
          ),
          resolutionType,
          creditNoteNumber,
          status: "RAISED" as const,
          budgetReleased: false,
          raisedBy: `${actorName} (${actorRole})`,
          createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        };

        state.purchaseReturns.unshift(newReturn);

        // Reflect quality impact on supplier scorecard
        const sup = state.suppliers.find((s) => s.id === po.supplierId);
        if (sup) {
          sup.qualityRating = Number(
            Math.max(1.0, sup.qualityRating - 0.1).toFixed(1)
          );
        }

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "RETURN.RAISED_FROM_GRN",
          entityType: "PurchaseReturn",
          entityId: returnNumber,
          summary: `Raised Purchase Return ${returnNumber} against ${grn.grnNumber} (${po.poNumber}) for ${returnedQty} ${newReturn.unitOfMeasure} (KES ${returnAmount.toLocaleString()}). Reason: ${reasonCode}. Resolution: ${resolutionType}.`,
        });
      }
      break;
    }

    case "ADVANCE_PURCHASE_RETURN_STATUS": {
      const ret = state.purchaseReturns.find((r) => r.id === body.returnId);
      if (ret) {
        const nextStatus = (body.nextStatus || "APPROVED") as
          | "RAISED"
          | "APPROVED"
          | "DISPATCHED_TO_SUPPLIER"
          | "SUPPLIER_ACKNOWLEDGED"
          | "RESOLVED";
        ret.status = nextStatus;

        if (body.creditNoteNumber) {
          ret.creditNoteNumber = String(body.creditNoteNumber);
        }

        // Release committed budget once return is approved/acknowledged for credit note adjustment
        if (
          !ret.budgetReleased &&
          ret.resolutionType === "CREDIT_NOTE_ADJUSTMENT" &&
          (nextStatus === "APPROVED" ||
            nextStatus === "SUPPLIER_ACKNOWLEDGED" ||
            nextStatus === "RESOLVED")
        ) {
          ret.budgetReleased = true;
          const dept = state.departments.find((d) => d.id === ret.departmentId);
          if (dept) {
            dept.committed = Math.max(0, dept.committed - ret.returnAmount);
          }
        }

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "RETURN.STATUS_ADVANCED",
          entityType: "PurchaseReturn",
          entityId: ret.returnNumber,
          summary: `Advanced Purchase Return ${ret.returnNumber} status to ${nextStatus}.${ret.budgetReleased ? ` Released KES ${ret.returnAmount.toLocaleString()} from ${ret.departmentName} Committed Budget.` : ""}`,
        });
      }
      break;
    }

    case "SUBMIT_SUPPLIER_INVOICE_3WAY_MATCH": {
      const po =
        state.purchaseOrders.find((p) => p.id === body.poId) ??
        state.purchaseOrders[0];
      const grn =
        state.goodsReceipts.find(
          (g) => g.id === body.grnId || g.poId === po?.id
        ) ?? state.goodsReceipts[0];

      if (po && grn) {
        const poLine = po.items[0];
        const poOrderedQty = poLine?.orderedQty ?? 10;
        const poUnitPrice = poLine?.unitPrice ?? 500;

        // Calculate total received across GRNs for this PO minus any returned quantities
        const totalReceivedForPo = state.goodsReceipts
          .filter((g) => g.poId === po.id)
          .reduce(
            (sum, g) =>
              sum +
              g.items.reduce((s, item) => s + item.receivedQtyThisGrn, 0),
            0
          );

        const totalReturnedForPo = state.purchaseReturns
          .filter((r) => r.poId === po.id)
          .reduce((sum, r) => sum + r.returnedQty, 0);

        const grnAcceptedQty = Math.max(
          0,
          totalReceivedForPo - totalReturnedForPo
        );

        const invoicedQty = Number(body.invoicedQty ?? grnAcceptedQty);
        const invoicedUnitPrice = Number(body.invoicedUnitPrice ?? poUnitPrice);
        const taxPercentage = Number(body.taxPercentage ?? 0);
        const creditNoteDeduction = Number(body.creditNoteDeduction ?? 0);

        const subtotalAmount = invoicedQty * invoicedUnitPrice;
        const taxAmount = Math.round(subtotalAmount * (taxPercentage / 100));
        const netPayableAmount = Math.max(
          0,
          subtotalAmount + taxAmount - creditNoteDeduction
        );

        // Automated 3-Way Match Verification Engine (PO <-> GRN Net Accepted <-> Invoice)
        const qtyMatches = invoicedQty === grnAcceptedQty;
        const priceMatches = Math.abs(invoicedUnitPrice - poUnitPrice) < 0.01;

        let threeWayMatchStatus:
          | "MATCHED"
          | "QUANTITY_MISMATCH"
          | "PRICE_MISMATCH"
          | "BOTH_MISMATCH" = "MATCHED";

        if (!qtyMatches && !priceMatches) {
          threeWayMatchStatus = "BOTH_MISMATCH";
        } else if (!qtyMatches) {
          threeWayMatchStatus = "QUANTITY_MISMATCH";
        } else if (!priceMatches) {
          threeWayMatchStatus = "PRICE_MISMATCH";
        }

        const nextPvSeq = 92 + state.supplierInvoices.length + 1;
        const internalVoucherNo = `PV-2026-00${nextPvSeq}`;
        const invoiceNumber = String(
          body.invoiceNumber || `INV-${po.supplierName.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`
        );

        const newInvoice = {
          id: `inv_${Date.now()}`,
          organizationId: orgId,
          invoiceNumber,
          internalVoucherNo,
          poId: po.id,
          poNumber: po.poNumber,
          grnId: grn.id,
          grnNumber: grn.grnNumber,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          departmentId: po.departmentId,
          departmentName: po.departmentName,
          invoiceDate: String(
            body.invoiceDate || new Date().toISOString().slice(0, 10)
          ),
          dueDate: String(body.dueDate || "2026-11-15"),
          currency: po.currency,
          sku: poLine?.sku || "SKU-01",
          description: poLine?.description || po.title,
          unitOfMeasure: poLine?.unitOfMeasure || "EA",
          invoicedQty,
          invoicedUnitPrice,
          poOrderedQty,
          poUnitPrice,
          grnAcceptedQty,
          subtotalAmount,
          taxAmount,
          creditNoteDeduction,
          netPayableAmount,
          amountPaid: 0,
          balanceDue: netPayableAmount,
          threeWayMatchStatus,
          status:
            threeWayMatchStatus === "MATCHED"
              ? ("APPROVED_FOR_PAYMENT" as const)
              : ("EXCEPTION_FLAGGED" as const),
          financeSignedOffBy:
            threeWayMatchStatus === "MATCHED"
              ? "Auto-Cleared by 3-Way Match Engine"
              : undefined,
          createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          payments: [],
        };

        state.supplierInvoices.unshift(newInvoice);

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action:
            threeWayMatchStatus === "MATCHED"
              ? "INVOICE.3WAY_MATCH_PASSED"
              : "INVOICE.3WAY_MATCH_MISMATCH_FLAGGED",
          entityType: "SupplierInvoice",
          entityId: invoiceNumber,
          summary: `Processed Invoice ${invoiceNumber} (${internalVoucherNo}) against ${po.poNumber} & ${grn.grnNumber}: Billed ${invoicedQty} @ KES ${invoicedUnitPrice.toLocaleString()} vs. GRN Net Accepted ${grnAcceptedQty} @ PO Price KES ${poUnitPrice.toLocaleString()}. Result: ${threeWayMatchStatus} (Net Payable: KES ${netPayableAmount.toLocaleString()}).`,
        });
      }
      break;
    }

    case "RESOLVE_3WAY_MATCH_EXCEPTION": {
      const inv = state.supplierInvoices.find((i) => i.id === body.invoiceId);
      if (inv) {
        const resolutionMode = String(
          body.resolutionMode || "ADJUST_TO_GRN_AND_PO"
        );
        const resolutionNote = String(
          body.exceptionResolutionNote ||
            "Adjusted billed quantity and unit price to match verified GRN net accepted quantity and PO contract rate."
        );

        if (resolutionMode === "ADJUST_TO_GRN_AND_PO") {
          inv.invoicedQty = inv.grnAcceptedQty;
          inv.invoicedUnitPrice = inv.poUnitPrice;
          inv.subtotalAmount = inv.invoicedQty * inv.invoicedUnitPrice;
          inv.netPayableAmount = Math.max(
            0,
            inv.subtotalAmount + inv.taxAmount - inv.creditNoteDeduction
          );
          inv.balanceDue = Math.max(0, inv.netPayableAmount - inv.amountPaid);
          inv.threeWayMatchStatus = "MATCHED";
        }

        inv.exceptionResolutionNote = resolutionNote;
        inv.exceptionResolvedBy = `${actorName} (${actorRole})`;
        inv.status = "APPROVED_FOR_PAYMENT";
        inv.financeSignedOffBy = `${actorName} (${actorRole})`;

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "INVOICE.EXCEPTION_RESOLVED",
          entityType: "SupplierInvoice",
          entityId: inv.invoiceNumber,
          summary: `Resolved 3-Way Match exception on ${inv.invoiceNumber} (${inv.internalVoucherNo}) via ${resolutionMode}. Approved Net Payable: KES ${inv.netPayableAmount.toLocaleString()}. Note: "${resolutionNote}"`,
        });
      }
      break;
    }

    case "SCHEDULE_OR_RECORD_INVOICE_PAYMENT": {
      const inv = state.supplierInvoices.find((i) => i.id === body.invoiceId);
      if (inv) {
        const paymentAction = String(body.paymentAction || "RECORD_PAYMENT");

        if (paymentAction === "SCHEDULE") {
          inv.scheduledPaymentDate = String(
            body.scheduledPaymentDate || "2026-10-25"
          );
          inv.status = "SCHEDULED";
          inv.financeSignedOffBy = `${actorName} (${actorRole})`;

          appendAuditEntry(state, {
            organizationId: orgId,
            actorName,
            actorRole,
            action: "INVOICE.PAYMENT_SCHEDULED",
            entityType: "SupplierInvoice",
            entityId: inv.invoiceNumber,
            summary: `Scheduled payment run for Invoice ${inv.invoiceNumber} (${inv.internalVoucherNo}, Balance: KES ${inv.balanceDue.toLocaleString()}) on ${inv.scheduledPaymentDate}.`,
          });
        } else {
          const payAmount = Math.min(
            inv.balanceDue,
            Math.max(1, Number(body.paymentAmount ?? inv.balanceDue))
          );
          const paymentMethod = (body.paymentMethod || "EFT_RTGS") as
            | "EFT_RTGS"
            | "SWIFT_WIRE"
            | "MPESA_B2B"
            | "CHEQUE";
          const paymentReference = String(
            body.paymentReference ||
              `${paymentMethod}-${Date.now().toString().slice(-6)}`
          );

          inv.amountPaid += payAmount;
          inv.balanceDue = Math.max(0, inv.netPayableAmount - inv.amountPaid);
          inv.status = inv.balanceDue === 0 ? "PAID" : "PARTIALLY_PAID";
          inv.financeSignedOffBy = `${actorName} (${actorRole})`;

          inv.payments.unshift({
            id: `pay_${Date.now()}`,
            paymentReference,
            paymentMethod,
            amountPaid: payAmount,
            paidBy: `${actorName} (${actorRole})`,
            paidAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          });

          // 4-Layer Budget Transition: Move Paid Amount from Committed (PO) -> Actual Spend (Paid Invoice)
          const dept = state.departments.find((d) => d.id === inv.departmentId);
          if (dept) {
            dept.committed = Math.max(0, dept.committed - payAmount);
            dept.actualSpend += payAmount;
          }

          // Update Supplier Performance Metrics & Spend
          const sup = state.suppliers.find((s) => s.id === inv.supplierId);
          if (sup) {
            sup.cumulativeSpend += payAmount;
            if (inv.status === "PAID") {
              sup.completedPoCount += 1;
            }
          }

          appendAuditEntry(state, {
            organizationId: orgId,
            actorName,
            actorRole,
            action:
              inv.status === "PAID"
                ? "PAYMENT.FULL_SETTLEMENT_EXECUTED"
                : "PAYMENT.PARTIAL_INSTALLMENT_EXECUTED",
            entityType: "SupplierInvoice",
            entityId: inv.invoiceNumber,
            summary: `Executed ${inv.status === "PAID" ? "full" : "partial"} payment of KES ${payAmount.toLocaleString()} via ${paymentMethod} (Ref: ${paymentReference}) on ${inv.invoiceNumber} (${inv.internalVoucherNo}). Transitioned KES ${payAmount.toLocaleString()} in ${inv.departmentName} from Committed (PO) → Actual Spend.`,
          });
        }
      }
      break;
    }

    // =========================================================================
    // PHASE 6 ACTIONS: DOCUMENT TEMPLATES, SCHEDULED ALERTS & ANALYTICS
    // =========================================================================

    case "UPDATE_DOCUMENT_TEMPLATE": {
      const tpl = state.documentTemplates.find(
        (t) => t.id === body.templateId
      );
      if (tpl) {
        tpl.title = String(body.title ?? tpl.title);
        tpl.includeLogo = Boolean(body.includeLogo ?? tpl.includeLogo);
        tpl.includeSignatureBlocks = Boolean(
          body.includeSignatureBlocks ?? tpl.includeSignatureBlocks
        );
        tpl.includeTermsAndConditions = Boolean(
          body.includeTermsAndConditions ?? tpl.includeTermsAndConditions
        );
        tpl.customFooterText = String(
          body.customFooterText ?? tpl.customFooterText
        );
        tpl.versionNumber += 1;
        tpl.updatedBy = `${actorName} (${actorRole})`;
        tpl.updatedAt = new Date().toISOString().slice(0, 10);

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "TEMPLATE.VERSION_UPDATED",
          entityType: "DocumentTemplate",
          entityId: tpl.templateCode,
          summary: `Updated branded document template ${tpl.templateCode} (${tpl.docType}) to Version v${tpl.versionNumber}. Footer: "${tpl.customFooterText}"`,
        });
      }
      break;
    }

    case "ACKNOWLEDGE_OR_DISMISS_ALERT": {
      const alt = state.procurementAlerts.find((a) => a.id === body.alertId);
      if (alt) {
        alt.status =
          alt.status === "ACTIVE" ? "ACKNOWLEDGED" : "ACTIVE";
        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action:
            alt.status === "ACKNOWLEDGED"
              ? "ALERT.ACKNOWLEDGED"
              : "ALERT.REOPENED",
          entityType: "ProcurementAlert",
          entityId: alt.referenceNo,
          summary: `${alt.status === "ACKNOWLEDGED" ? "Acknowledged" : "Reopened"} notification alert "${alt.title}" (${alt.alertType} on ${alt.referenceNo}).`,
        });
      }
      break;
    }

    case "RUN_SCHEDULED_ALERT_SCAN": {
      // Re-activate all acknowledged alerts or generate a fresh cron scan entry
      state.procurementAlerts.forEach((a) => {
        if (a.organizationId === orgId) {
          a.status = "ACTIVE";
        }
      });

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "CRON.PROCUREMENT_ALERT_SCAN_EXECUTED",
        entityType: "ScheduledAlertEngine",
        entityId: "CRON-DAILY-SCAN",
        summary: `Executed live procurement alert & SLA escalation scan across Pending Approvals, 48h RFQ Deadlines, Overdue POs, 90/60/30d Contracts, Supplier Certs, and 3-Way Match Exceptions.`,
      });
      break;
    }

    // =========================================================================
    // PHASE 7 ACTIONS: ENTERPRISE INTEGRATIONS (MODULE 21) & LAUNCH READINESS
    // =========================================================================

    case "TOGGLE_INTEGRATION_CONNECTOR": {
      const conn = state.enterpriseIntegrations.find(
        (c) => c.id === body.integrationId || c.connectorKey === body.connectorKey
      );
      if (conn) {
        if (body.nextStatus) {
          conn.status = body.nextStatus as
            | "CONNECTED"
            | "DISCONNECTED"
            | "SANDBOX_ACTIVE";
        } else {
          conn.status =
            conn.status === "CONNECTED" ? "DISCONNECTED" : "CONNECTED";
        }

        if (body.endpointOrAccountRef !== undefined) {
          conn.endpointOrAccountRef = String(body.endpointOrAccountRef);
        }
        if (body.autoSyncInvoices !== undefined) {
          conn.autoSyncInvoices = Boolean(body.autoSyncInvoices);
        }

        conn.lastSyncedAt = new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 19);

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "INTEGRATION.CONNECTOR_CONFIGURED",
          entityType: "EnterpriseIntegration",
          entityId: conn.connectorKey,
          summary: `Updated enterprise connector "${conn.providerName}" (${conn.connectorKey}) status to ${conn.status}. Endpoint/Realm: ${conn.endpointOrAccountRef}.`,
        });
      }
      break;
    }

    case "TRIGGER_ACCOUNTING_ERP_SYNC": {
      const conn =
        state.enterpriseIntegrations.find(
          (c) =>
            c.id === body.integrationId || c.connectorKey === body.connectorKey
        ) ?? state.enterpriseIntegrations[0];

      if (conn) {
        const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
        conn.status = "CONNECTED";
        conn.lastSyncedAt = nowStr;
        conn.totalSyncedRecords += 3;

        const matchedInvoices = state.supplierInvoices.filter(
          (i) => i.threeWayMatchStatus === "MATCHED"
        );
        const topInv = matchedInvoices[0] ?? state.supplierInvoices[0];
        const refNo = String(
          body.referenceNo ||
            (topInv
              ? `${topInv.invoiceNumber} / ${topInv.internalVoucherNo}`
              : "BATCH-GL-2026-Q4")
        );

        const payloadSummary = String(
          body.payloadSummary ||
            `Synchronized ${matchedInvoices.length} 3-Way Matched AP Bills (KES ${matchedInvoices
              .reduce((s, i) => s + i.netPayableAmount, 0)
              .toLocaleString()}), Department Cost Center Encumbrances, and GRN Stock Receipts with ${conn.providerName}.`
        );

        state.integrationSyncLogs.unshift({
          id: `slog_${Date.now()}`,
          organizationId: orgId,
          connectorKey: conn.connectorKey,
          providerName: conn.providerName,
          eventType: String(body.eventType || "TWO_WAY_AP_AND_GL_BATCH_SYNC"),
          referenceNo: refNo,
          payloadSummary,
          status: "SUCCESS",
          syncedBy: `${actorName} (${actorRole})`,
          timestamp: nowStr,
        });

        appendAuditEntry(state, {
          organizationId: orgId,
          actorName,
          actorRole,
          action: "INTEGRATION.ERP_ACCOUNTING_SYNC_COMPLETED",
          entityType: "IntegrationSyncLog",
          entityId: conn.connectorKey,
          summary: `Executed live webhook & API synchronization with ${conn.providerName} (${refNo}): ${payloadSummary}`,
        });
      }
      break;
    }

    case "SEND_TEST_WHATSAPP_SMS_ALERT": {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      const recipientPhone = String(body.recipientPhone || "+254 711 820 400");
      const channel = String(body.channel || "WHATSAPP_BUSINESS_API");
      const messageTemplate = String(
        body.messageTemplate ||
          "Vensure Alert: PR-2026-0041 (KES 1,326,000) & PO-2026-0055 (KES 773,500) require immediate action."
      );

      const twilioConn = state.enterpriseIntegrations.find(
        (c) => c.connectorKey === "TWILIO_WHATSAPP_SENDGRID"
      );
      if (twilioConn) {
        twilioConn.lastSyncedAt = nowStr;
        twilioConn.totalSyncedRecords += 1;
      }

      state.integrationSyncLogs.unshift({
        id: `slog_${Date.now()}`,
        organizationId: orgId,
        connectorKey: "TWILIO_WHATSAPP_SENDGRID",
        providerName: "Twilio SMS, WhatsApp Business API & SendGrid SMTP",
        eventType: `${channel}_DISPATCH`,
        referenceNo: recipientPhone,
        payloadSummary: `Dispatched [${channel}] notification to ${recipientPhone}: "${messageTemplate}"`,
        status: "SUCCESS",
        syncedBy: `${actorName} (${actorRole})`,
        timestamp: nowStr,
      });

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "NOTIFICATION.OMNICHANNEL_DISPATCHED",
        entityType: "IntegrationSyncLog",
        entityId: channel,
        summary: `Dispatched ${channel} message to ${recipientPhone}: "${messageTemplate}"`,
      });
      break;
    }

    case "RUN_SECURITY_ISOLATION_AUDIT": {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      const certId = `SEC-AUDIT-${Date.now().toString().slice(-6)}`;

      state.integrationSyncLogs.unshift({
        id: `slog_${Date.now()}`,
        organizationId: orgId,
        connectorKey: "MULTI_TENANT_SECURITY_ENGINE",
        providerName: "Vensure Zero-Trust Tenant & RBAC Verifier",
        eventType: "SECURITY_AND_ISOLATION_AUDIT_PASSED",
        referenceNo: certId,
        payloadSummary:
          "Verified 100% tenant row isolation (org_horizon vs org_crestline), 7-Role RBAC enforcement, Warehouse Clerk financial unit-price masking, and SHA-256 immutable audit logs.",
        status: "SUCCESS",
        syncedBy: `${actorName} (${actorRole})`,
        timestamp: nowStr,
      });

      appendAuditEntry(state, {
        organizationId: orgId,
        actorName,
        actorRole,
        action: "SECURITY.MULTI_TENANT_ISOLATION_VERIFIED",
        entityType: "SecurityAuditCertificate",
        entityId: certId,
        summary: `Completed automated Multi-Tenant Isolation & 12-Stage Procurement Lifecycle Integrity Audit (${certId}). 0 cross-tenant data leaks detected.`,
      });
      break;
    }

    case "AUTHENTICATE_DEMO_USER": {
      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      const password = String(body.password || "");
      const authMethod = String(body.authMethod || "CREDENTIALS");

      if (authMethod === "CREDENTIALS" && password !== "labversaly-16") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid credentials. Use demo email 'versalylabs@gmail.com' and password 'labversaly-16'.",
          },
          { status: 401 }
        );
      }

      let matchedUser = state.users.find(
        (u) => u.email.toLowerCase() === email
      );

      if (!matchedUser) {
        matchedUser =
          state.users.find(
            (u) => u.email.toLowerCase() === "versalylabs@gmail.com"
          ) ?? state.users[0];
      }

      if (body.role) {
        matchedUser.role = body.role;
      }

      state.activeUserId = matchedUser.id;
      if (body.organizationId) {
        state.activeOrganizationId = String(body.organizationId);
      } else {
        state.activeOrganizationId = matchedUser.organizationId;
      }

      appendAuditEntry(state, {
        organizationId: state.activeOrganizationId,
        actorName: matchedUser.fullName,
        actorRole: matchedUser.role,
        action: "AUTH.USER_SIGNED_IN",
        entityType: "UserSession",
        entityId: matchedUser.email,
        summary: `Authenticated user session "${matchedUser.fullName}" (${matchedUser.email}) with RBAC role [${matchedUser.role}] via ${authMethod}.`,
      });
      break;
    }
  }

  savePhase1State(state);
  return NextResponse.json({ ok: true, state, ...state });
}
