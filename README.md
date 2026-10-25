# CrimiNetAI

## AI-Powered Cybercrime Investigation and Network Analysis

**Smart India Hackathon 2026 · Problem Statement SIH26184**  
**Problem Statement:** Development of a Predictive Analytics Framework for Cybercrime Complaints to Forecast Likely Cash Withdrawal Locations in Advance, Enabling Generation of Actionable Intelligence for Timely and Proactive Cybercrime Intervention.  
**Organization:** Ministry of Home Affairs  
**Theme:** Blockchain & Cybersecurity  
**Category:** Software  
**Team:** Think Forge  
**Repository:** https://github.com/rudradesa/criminet

---

## 1. Overview

CrimiNetAI is a graph-based cybercrime investigation platform designed to help investigators explore entities and relationships connected to cybercrime cases. It brings related records into a connected graph so investigators can examine associations, follow links across multiple levels, and explore information through an investigation tree and interactive graph visualization.

For SIH 26184, this existing investigation platform is presented in the context of analysing cybercrime complaints and exploring connections that may help investigators understand patterns relevant to the problem statement's focus on likely cash-withdrawal locations.

**Scope note:** The current project code remains the same. This README aligns the project's description with the new problem statement; it does not claim that a cash-withdrawal forecasting model, GIS hotspot map, or real-time alert system has been added or implemented.

## 2. Problem Statement Context

Cybercrime investigations can involve information spread across multiple complaints and records. Finding connections between people, phone numbers, cases, vehicles, addresses, and locations can help investigators explore whether records may be related.

SIH 26184 focuses specifically on forecasting likely cash-withdrawal locations in advance to support timely and proactive intervention. CrimiNetAI's existing graph-based investigation capabilities provide a way to examine connected entities and relationships that may be relevant during cybercrime complaint analysis. Graph connections are investigative leads and do not, by themselves, establish that a person is involved in a crime or predict where cash will be withdrawn.

## 3. Existing Project Features

The following features describe the existing project foundation:

- **Entity management:** Manage records such as people, cases, phone numbers, vehicles, addresses, and locations.
- **Neo4j graph database:** Store entities and their relationships as a graph.
- **Relationship discovery:** Explore associations between records using available identifiers and attributes.
- **Multi-hop analysis:** Follow indirect links through connected entities.
- **Investigation tree:** Explore related records from a selected entity to a chosen depth.
- **Interactive graph visualization:** View and navigate connected records using D3.js.
- **Node.js and Express backend:** Handle application routes and server-side functionality.
- **EJS interface:** Render the existing web interface.
- **Ollama integration foundation:** The repository includes a service for local LLM integration; the exact AI behaviour should be checked against the current code and running application.

These features support connected-record exploration and investigation. They should not be described as a completed predictive analytics engine for cash-withdrawal locations unless that functionality is implemented and validated separately.

## 4. How the Existing Project Relates to SIH 26184

The current application can be positioned as an investigation and relationship-analysis component relevant to cybercrime complaint analysis:

1. Investigators work with the records and entities available in the system.
2. The application represents available entities and relationships in Neo4j.
3. Relationship discovery and multi-hop analysis help explore connections among records.
4. The investigation tree and graph visualization help users inspect the connected information.
5. Investigators can use the explored relationships as context while examining cybercrime cases.

This describes the role of the existing code. It does **not** claim that the application currently calculates future cash-withdrawal locations or provides predictive risk scores.

## 5. Technology Stack

| Technology | Role in the existing project |
|---|---|
| Node.js | Backend runtime |
| Express.js | Web server and routing |
| EJS | Server-rendered interface |
| Neo4j | Graph database for entities and relationships |
| D3.js | Interactive graph visualization |
| Ollama | Local LLM integration foundation; verify the implemented use cases in the code |

The stack and codebase are unchanged for this problem-statement update.

## 6. Relevance to the Problem Statement

SIH 26184 asks for a predictive analytics framework that forecasts likely cash-withdrawal locations from cybercrime complaint information. CrimiNetAI currently contributes graph-based investigation features that can help users examine relationships across available records.

The distinction is important:

- **Implemented foundation:** Entity management, graph storage, relationship exploration, multi-hop analysis, investigation tree, and graph visualization.
- **Not claimed as implemented by this README:** A validated cash-withdrawal location prediction model, a production GIS risk heatmap, or live operational alerts.

Any demonstration or submission should describe only what can be shown working in the current code. Do not present planned functionality as completed functionality.

## 7. Repository Setup

Repository: https://github.com/rudradesa/criminet

The application uses Node.js, npm, and Neo4j. Check the repository's current `package.json` and environment example for the exact scripts and configuration.

```bash
git clone https://github.com/rudradesa/criminet.git
cd criminet
npm install
```

Create a local `.env` file using the configuration expected by the project, and provide the correct Neo4j connection details. Run the start command defined in `package.json`.

**Security:** Do not commit `.env` files, database passwords, API keys, real complaint data, or other secrets to the repository.

## 8. Responsible Use

- Treat graph relationships as leads for investigation, not proof of wrongdoing.
- Verify information against source records before drawing conclusions.
- Protect sensitive personal and financial information.
- Use appropriate access controls for investigative data.
- Avoid exposing real complaint details in public demonstrations, screenshots, logs, or repository examples.
- Do not claim predictive accuracy or operational impact without testing and evidence.

## 9. SIH 2026 Details

- **Problem Statement ID:** SIH26184
- **Organization:** Ministry of Home Affairs
- **Theme:** Blockchain & Cybersecurity
- **Category:** Software
- **Team:** Think Forge

**Problem statement title:** Development of a Predictive Analytics Framework for Cybercrime Complaints to Forecast Likely Cash Withdrawal Locations in Advance, Enabling Generation of Actionable Intelligence for Timely and Proactive Cybercrime Intervention.

---

## Team Think Forge

**CrimiNetAI — SIH 2026 · SIH26184**

*Exploring connected cybercrime records to support investigation and analysis relevant to proactive cybercrime intervention.*

