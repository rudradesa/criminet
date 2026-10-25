# CrimiNetAI
## Predictive Analytics for Cybercrime Complaints & Cash-Withdrawal Hotspots

**Smart India Hackathon 2026 · Problem Statement SIH26184**  
**Official problem statement:** Development of a Predictive Analytics Framework for Cybercrime Complaints to Forecast Likely Cash Withdrawal Locations in Advance, Enabling Generation of Actionable Intelligence for Timely and Proactive Cybercrime Intervention.  
**Organization:** Ministry of Home Affairs  
**Theme:** Blockchain & Cybersecurity  
**Category:** Software  
**Team:** Think Forge  
**Repository:** https://github.com/rudradesa/criminet

---

## 1. Overview

CrimiNetAI is a cybercrime-intelligence platform concept that aims to help authorized investigators identify patterns across cybercrime complaints and connected entities, and support the prediction of locations where fraud-related funds may be withdrawn as cash.

The goal is to support earlier, evidence-based intervention. By connecting complaint information with relevant entities and geographic signals, the system can help analysts investigate patterns, inspect potential hotspots, and share actionable intelligence with authorized law-enforcement and financial-sector personnel.

**Important implementation note:** The existing repository provides a graph-based investigation foundation—entity management, Neo4j graph storage, relationship discovery, multi-hop analysis, an investigation tree, and interactive visualization. A validated predictive model for cash-withdrawal locations, a production GIS risk heatmap, and live alert integrations must not be considered implemented unless they are separately built and tested. This README distinguishes the current foundation from the proposed SIH-focused extensions.

## 2. Problem Statement

The National Cybercrime Reporting Portal receives a high volume of complaints. Information relevant to a single cyber-fraud investigation may be distributed across complaint records, phone numbers, bank or payment references, people, cases, locations, and other evidence. Manual cross-referencing can delay the identification of connected incidents and potential cash-out activity.

The SIH26184 challenge is specifically to develop a predictive analytics framework that forecasts likely cash-withdrawal locations in advance, so authorized agencies can consider timely interventions. It is not enough to display a network of related people: the solution needs a location-focused prediction and operational response workflow.

### The key questions

- Which complaints appear to share a fraud pattern or relevant entities?
- Which locations may warrant closer attention based on historical and current evidence?
- What evidence supports a hotspot prediction, and how reliable is it?
- How can authorized investigators and participating financial institutions receive useful alerts in time?
- How can the system protect sensitive complaint and financial data while avoiding unsupported accusations?

## 3. Proposed Solution

CrimiNetAI is proposed as a decision-support system with five connected capabilities:

1. **Complaint data ingestion:** Import authorized, appropriately protected complaint and historical records.
2. **Entity and pattern analysis:** Normalize relevant fields and identify potential connections across complaints.
3. **Predictive analytics:** Use suitable historical data and validated features to estimate risk for geographic areas and time windows.
4. **Risk heatmap and investigation interface:** Show risk estimates, trends, filters, supporting evidence, and the limits of each prediction.
5. **Actionable alerts:** Provide controlled notifications to authorized users when a validated threshold or rule is met.

The system should prioritize *potential cash-withdrawal locations and risk areas*, not label an individual as guilty. Every prediction is an investigative lead requiring human verification.

## 4. Proposed End-to-End Workflow

```text
Authorized Cybercrime Complaint Data
                 |
                 v
        Data Validation & Cleaning
                 |
                 v
     Entity Resolution and Pattern Analysis
                 |
                 v
       Historical / Geospatial Features
                 |
                 v
      Predictive Risk-Scoring Model
                 |
                 v
    Risk Score by Location and Time Window
                 |
        +--------+---------+
        |                  |
        v                  v
 GIS Risk Heatmap    Evidence & Case Graph
        |                  |
        +--------+---------+
                 |
                 v
       Authorized Analyst Review
                 |
                 v
     Audited Alerts / Actionable Reports
```

This is the **proposed SIH workflow**, not a claim that every component currently exists in the repository.

## 5. Current Prototype Foundation

The existing application focuses on graph-based investigation and connected-record exploration.

### Existing foundation described by the repository

- **Entity management:** Manage person, case, phone, vehicle, address, and location records.
- **Neo4j graph storage:** Represent entities and their associations as a graph.
- **Relationship discovery:** Find associations using available identifiers and attributes.
- **Multi-hop analysis:** Explore indirect links through connected entities.
- **Investigation tree:** Start from a selected entity and explore related records by depth.
- **Interactive graph visualization:** Explore the resulting network through D3.js.
- **Ollama integration foundation:** A service is present for local LLM integration; actual AI behavior should be verified against the running application and current code.

These capabilities can support complaint correlation and evidence exploration. They do **not**, by themselves, predict cash-withdrawal locations. That requires geospatial and temporal features, suitable labelled historical data, a forecasting/risk-scoring model, and evaluation.

## 6. Proposed SIH-Specific Modules

### A. Complaint ingestion and normalization

- Import only data that the team is authorized to use.
- Validate timestamps, geographic fields, complaint categories, and relevant identifiers.
- Standardize formats and handle missing or inconsistent values.
- Preserve source references so an analyst can trace a finding back to its evidence.

### B. Cross-complaint entity resolution

- Identify candidate links across records using appropriate identifiers and documented matching rules.
- Represent relevant entities and relationships in Neo4j where graph analysis adds value.
- Record the source and reason for each association.
- Treat uncertain matches as candidates for review, not as confirmed facts.

### C. Predictive analytics engine

The model should estimate the likelihood or relative risk of a cash-withdrawal event in a geographic area during a defined future time window.

Potential feature groups, **subject to data availability and legal authorization**, include:

- Historical cyber-fraud complaint counts by area and time.
- Historical, verified cash-out incident locations and timestamps.
- Changes in complaint volume and recurring fraud patterns.
- Time-based and geographic patterns.
- Evidence-backed relationships between relevant complaints and entities.

The final features and model must be selected after inspecting the available dataset. Do not claim model accuracy or predictive capability until it has been measured on held-out data.

### D. Geographic risk heatmap

The planned GIS dashboard should support:

- Map-based display of risk by area and forecast window.
- Filters for time, location, and relevant complaint category.
- Clear risk levels and timestamps showing when the estimate was generated.
- Drill-down to authorized supporting evidence.
- A distinction between historical incidents, current reports, and predicted risk.

### E. Alert and investigation workflow

- Generate an alert only when defined and evaluated criteria are met.
- Include the predicted area and time window, risk score, evidence summary, model/version, and limitations.
- Route alerts only to authorized roles.
- Log who viewed, acknowledged, escalated, or closed an alert.
- Keep human review in the decision loop before operational intervention.

## 7. Suggested System Architecture

### Existing technology foundation

| Technology | Current / intended role |
|---|---|
| Node.js | Existing backend runtime |
| Express.js | Existing web server and route layer |
| EJS | Existing server-rendered interface |
| Neo4j | Existing graph database for investigation entities and links |
| D3.js | Existing interactive graph visualization |
| Ollama | Local LLM integration foundation; verify implemented use cases |

### Proposed extensions for SIH26184

| Component | Possible technology | Purpose |
|---|---|---|
| Predictive analytics | Python and suitable ML/geospatial libraries | Train and evaluate a location/time risk model |
| Prediction API | FastAPI or an API integrated into the existing backend | Serve versioned risk predictions |
| Geographic dashboard | Leaflet or another suitable GIS library | Display forecast areas and map filters |
| Data processing | Python/SQL and validated pipelines | Clean, aggregate, and prepare authorized historical data |
| Notifications | Email/SMS/API integration, subject to access | Deliver controlled alerts to authorized recipients |
| Audit and access control | Role-based authorization and audit logs | Restrict and record access to sensitive data |

The proposed stack is not a claim that all these extensions are currently implemented. Avoid describing a planned Python/FastAPI/React architecture as the existing stack unless the codebase has actually been migrated and verified.

## 8. Data Requirements and Evaluation

The most important feasibility dependency is access to sufficiently detailed, legally usable historical data that links cybercrime complaints to verified cash-withdrawal events and their locations and times.

A demo can use synthetic or public data clearly labelled as such. Synthetic data can demonstrate workflow and UI behavior, but it cannot establish real-world predictive performance.

Before claiming that the model works, evaluate it using a time-aware holdout set or backtesting that prevents future information from leaking into training. Appropriate measures may include:

- Precision among the highest-risk locations flagged.
- Recall of verified cash-out incidents within the selected top-risk areas.
- False-alert rate and alert volume.
- Lead time between an alert and a verified event, where timestamps allow it.
- Calibration of predicted risk, where suitable labels and enough data exist.
- Performance across locations, periods, and relevant complaint categories.

Compare the model with a simple baseline, document data limitations, and report results honestly. Do not invent dataset sizes, accuracy, saved money, prevented fraud, or response-time improvements.

## 9. Feasibility, Challenges, and Mitigations

| Challenge | Mitigation |
|---|---|
| Restricted access to complaint and financial data | Develop a synthetic-data demo first; seek formal, authorized access for real evaluation |
| Incomplete or inconsistent records | Data validation, missing-value handling, provenance, and explicit uncertainty |
| Sparse verified cash-out labels | Start with a transparent baseline and report limitations; do not overstate forecast reliability |
| Geographic and temporal bias | Time-based evaluation and checks across locations and periods |
| False positives | Human review, explainable evidence, calibrated thresholds, and monitoring |
| Sensitive personal and financial information | Data minimization, encryption, role-based access, audit trails, and retention controls |
| Operational alert overload | Prioritization, configurable thresholds, deduplication, and alert-quality evaluation |
| Integration with agencies and financial institutions | Documented APIs, authorized integrations, and controlled testing |

## 10. Privacy, Security, and Responsible Use

CrimiNetAI is intended as an investigative decision-support tool.

- A shared identifier or graph connection does not prove wrongdoing.
- A predicted hotspot is a risk estimate, not proof that a crime will occur.
- Keep personally identifiable and financial data to the minimum necessary.
- Use role-based access, secure credential handling, encryption in transit and at rest, and auditable access logs.
- Use synthetic or appropriately de-identified data for public demonstrations.
- Record evidence provenance, model versions, prediction timestamps, and uncertainty.
- Require authorized human review before consequential action.
- Follow applicable legal requirements, data-sharing agreements, and institutional policies.
- Do not expose sensitive complaint details in public dashboards, screenshots, logs, or repository examples.

## 11. Blockchain and Cybersecurity Theme

The problem statement is categorized under Blockchain & Cybersecurity, but blockchain should not be claimed as implemented merely because it is named in the proposal.

A defensible optional extension would be tamper-evident audit records for selected events—such as a prediction being generated, an alert being acknowledged, or evidence metadata being changed—without placing raw personal or financial data on a public blockchain. A signed append-only audit log may also be a simpler alternative. Any ledger approach should be justified against privacy, performance, access-control, and deployment requirements.

## 12. Expected Impact

If validated with appropriate data and deployed with authorized partners, the system could help:

- Identify areas that merit earlier investigative attention.
- Correlate related complaints more efficiently.
- Present location-based risk and supporting evidence in one interface.
- Improve coordination among authorized law-enforcement and financial-sector teams.
- Prioritize human review and potentially shorten response workflows.

These are intended benefits, not measured results. Actual impact must be established through evaluation and a controlled pilot.

## 13. Repository and Setup

Repository: https://github.com/rudradesa/criminet

The current application uses Node.js, npm, and Neo4j. Confirm the repository's `package.json`, environment example, and current README before running commands.

Typical setup flow:

```bash
git clone https://github.com/rudradesa/criminet.git
cd criminet
npm install
```

Create a local `.env` file based on the repository's `.env.example`, set the appropriate Neo4j connection details, and run the start script defined in `package.json` (commonly `npm start` for production-style startup or `npm run dev` for development if that script exists).

Do not commit `.env`, database passwords, API keys, real complaint data, or other secrets. Use the project's actual configuration and scripts rather than assuming that every deployment uses the same settings.

## 14. Roadmap

1. **Foundation:** Verify the existing entity, graph, investigation-tree, and visualization flows.
2. **Data pipeline:** Define a safe complaint schema and create a reproducible synthetic demo dataset.
3. **Geospatial preparation:** Aggregate historical events by location and time, where fields are available.
4. **Baseline forecasting:** Build a transparent baseline and compare it with candidate models.
5. **Risk map:** Visualize predictions with time windows, provenance, and uncertainty.
6. **Alerts:** Add controlled alerts, role checks, acknowledgement, and audit logs.
7. **Validation:** Backtest with authorized, verified data and document limitations.
8. **Pilot readiness:** Review security, privacy, integration, and operational requirements with relevant stakeholders.

## 15. References

- Smart India Hackathon 2026, **SIH26184**: *Development of a Predictive Analytics Framework for Cybercrime Complaints to Forecast Likely Cash Withdrawal Locations in Advance, Enabling Generation of Actionable Intelligence for Timely and Proactive Cybercrime Intervention.*  
  Problem-statement listing: https://sih2026.ankus.dev/en/orgs/ministry-of-home-affairs  
  Detailed problem statement and deliverables: https://sihone.pages.dev/ps/26184
- National Cyber Crime Reporting Portal: https://cybercrime.gov.in/
- National Crime Records Bureau: https://ncrb.gov.in/
- NITI Aayog: https://www.niti.gov.in/

Check current official sources and obtain permission before using any restricted data. The SIH problem-statement listing above is a publicly accessible secondary listing; use the official SIH portal or organizer-provided statement as the final authority for submission requirements.

---

## Team Think Forge

**CrimiNetAI — SIH 2026 · SIH26184**

*Turning cybercrime complaint patterns into evidence-backed, location-focused intelligence for timely intervention.*

**Implementation status matters:** Keep the README updated as modules are completed. Clearly label each feature as implemented, in progress, or proposed, and publish performance numbers only after reproducible evaluation.
