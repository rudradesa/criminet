# 🔍 CrimiNet

## AI-Powered Criminal Network Analysis System

> **Smart India Hackathon 2025/2026**  
> **Problem Statement ID:** 26189  
> **Problem Statement:** AI Powered Criminal Network Analysis System  
> **Team:** Think Forge  
> **Theme:** Blockchain & Cybersecurity  
> **Category:** Software

---

## 🚨 Problem Statement

Criminal investigations involve large amounts of fragmented information such as **FIRs, case records, phone numbers, vehicle details, addresses, locations, and person records**.

The major challenge is not only storing this information, but **discovering hidden and indirect connections between different records**.

For example:

```text
Person A
   ↓
Phone Number
   ↓
Person B
   ↓
Case
   ↓
Vehicle
   ↓
Person C

When such information is analyzed manually, investigators may spend significant time searching across records and can find it difficult to understand complex multi-hop connections.

The proposed solution combines data ingestion, entity extraction, graph construction, advanced analysis, and visualization to help investigators understand complex criminal networks.

💡 Our Solution

CrimiNet is a graph-based criminal intelligence and investigation platform designed to transform fragmented investigation data into a connected and explorable intelligence graph.

Instead of treating every record as an isolated piece of information, CrimiNet represents investigation entities as nodes in a Neo4j graph database and discovers associations between them.

The system works with entities such as:

👤 Persons
📁 Cases
📱 Phones
🚗 Vehicles
🏠 Addresses
📍 Locations
Core Idea

Start from one entity and discover the connected investigation network around it.

🔄 How CrimiNet Works
              Investigation Data
                       ↓
                Entity Management
                       ↓
                  Neo4j Graph
                       ↓
            Relationship Discovery
                       ↓
               Multi-Hop Analysis
                       ↓
              Investigation Tree
                       ↓
             Graph Visualization

The broader proposed AI pipeline is:

Data Ingestion
      ↓
Entity Extraction
      ↓
Graph Construction
      ↓
Advanced Analysis
      ↓
Visualization
🧩 Entity Model

CrimiNet represents different investigation entities and their associations in a graph.

┌──────────┐
│  PERSON  │
└────┬─────┘
     │
     ├────────── PHONE
     │
     ├────────── VEHICLE
     │
     ├────────── ADDRESS
     │
     └────────── CASE
                    │
                    └──── LOCATION
Supported Entity Types
PERSON
CASE
PHONE
VEHICLE
ADDRESS
LOCATION
🔗 Automatic Relationship Discovery

One of the core features of CrimiNet is runtime relationship discovery.

The system does not require investigators to manually create every relationship between entities.

Instead, the analysis engine can identify associations using common identifiers and attributes.

Current Association Rules
Person phone number ↔ Phone number

Person vehicle registration ↔ Vehicle registration

Person address + city (+ state) ↔ Address

Case person ID ↔ Person

Case phone ID ↔ Phone

Case vehicle ID ↔ Vehicle

Case location ID ↔ Location
Example
┌──────────┐
│ Person A │
└────┬─────┘
     │
     │ Same Phone Number
     ↓
┌──────────────┐
│ Phone Number │
└──────┬───────┘
       │
       ↓
┌──────────┐
│ Person B │
└──────────┘

This allows the system to identify possible investigative associations from the available data.

🌳 Multi-Hop Investigation

CrimiNet enables investigators to explore connections beyond direct relationships.

For example:

Person A
   ↓
Phone
   ↓
Person B
   ↓
Case
   ↓
Vehicle
   ↓
Person C
   ↓
Location

An investigator can start with one entity and progressively explore connected entities across multiple hops.

This is useful when an important connection is not directly stored between two people but exists through another entity.

🔎 Investigation Tree

After selecting a root entity, CrimiNet performs graph traversal to discover connected entities.

Example:

                    Person A
                       │
              ┌────────┴────────┐
              ↓                 ↓
            Phone             Vehicle
              │                 │
              ↓                 ↓
           Person B            Case
              │                 │
              ↓                 ↓
           Case 02            Person C
              │
              ↓
           Location

The investigation engine constructs an investigation tree from the selected root entity, allowing the investigator to explore the network layer by layer.

📊 Interactive Graph Visualization

Complex investigation networks can be difficult to understand using traditional tables.

CrimiNet provides an interactive graph visualization using D3.js.

The visualization represents entities and their discovered associations as a connected network.

                 PERSON A
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
        PHONE      CASE     VEHICLE
          │         │         │
          ↓         ↓         ↓
       PERSON B  LOCATION   PERSON C

The graph allows investigators to visually understand:

Connected people
Cases
Phone numbers
Vehicles
Addresses
Locations
Multi-hop connections
Investigation paths
🤖 AI-Powered Vision

The broader CrimiNet solution proposed for the SIH problem includes an AI layer using Ollama + a local LLM.

The proposed pipeline is:

                  Crime Records
                       ↓
                Data Ingestion
                       ↓
                Entity Extraction
                       ↓
              Graph Construction
                       ↓
              Advanced Analysis
                       ↓
                Visualization

The AI layer can be used to extract entities and relationships from unstructured crime-related records and provide structured information to the graph-based investigation system.

The current repository focuses primarily on the graph-based investigation foundation, including:

Entity management
Neo4j graph storage
Runtime relationship discovery
Multi-hop analysis
Investigation-tree generation
Graph visualization

The AI extraction and advanced analytical capabilities can be integrated as additional layers over this foundation.

🏗️ System Architecture
                         ┌─────────────────┐
                         │  INVESTIGATOR   │
                         └────────┬────────┘
                                  │
                                  ↓
                    ┌────────────────────────┐
                    │     Web Interface      │
                    │       EJS + D3.js      │
                    └───────────┬────────────┘
                                │
                                ↓
                    ┌────────────────────────┐
                    │    Node.js + Express   │
                    │                        │
                    │  Entity Management     │
                    │  Analysis              │
                    │  Graph API             │
                    │  Relationship Discovery│
                    └───────────┬────────────┘
                                │
                                ↓
                    ┌────────────────────────┐
                    │         Neo4j           │
                    │     Graph Database      │
                    └───────────┬────────────┘
                                │
                                ↓
                    ┌────────────────────────┐
                    │  Investigation Engine   │
                    │                        │
                    │  Multi-Hop Traversal   │
                    │  Association Discovery │
                    │  Investigation Tree    │
                    └───────────┬────────────┘
                                │
                                ↓
                    ┌────────────────────────┐
                    │   D3.js Visualization  │
                    └────────────────────────┘
🛠️ Technology Stack
Technology	Purpose
Node.js	Backend runtime
Express.js	Server and API layer
EJS	Web interface
Neo4j	Graph database
D3.js	Interactive graph visualization
Ollama	Local AI/LLM integration
📁 Project Structure
criminet/
│
├── neo4j/
│   ├── PHASE4_DEMO_RAW_DATA.cypher
│   ├── RAW_DATA_SETUP.cypher
│   ├── schema.cypher
│   └── seed.cypher
│
├── public/
│   └── css/
│
├── src/
│   ├── config/
│   │   └── neo4j.js
│   │
│   ├── routes/
│   │   ├── ai.js
│   │   ├── analysis.js
│   │   ├── entities.js
│   │   ├── graph.js
│   │   └── relationships.js
│   │
│   ├── services/
│   │   ├── entityService.js
│   │   └── ollamaService.js
│   │
│   └── server.js
│
├── views/
│   ├── dashboard.ejs
│   ├── data-entry.ejs
│   ├── entity-detail.ejs
│   ├── graph.ejs
│   └── relationships.ejs
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
🚀 Getting Started
Prerequisites

Make sure the following are installed:

Node.js
npm
Neo4j
1. Clone the Repository
git clone https://github.com/rudradesa/criminet.git
cd criminet
2. Install Dependencies
npm install
3. Configure Environment Variables

Create a .env file using .env.example.

Example:

NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=criminalintelligence
PORT=3000

⚠️ Never commit your real .env file, passwords, API keys, or other sensitive credentials to GitHub.

4. Configure Neo4j

The repository contains Cypher scripts inside:

neo4j/

including:

schema.cypher
seed.cypher
RAW_DATA_SETUP.cypher
PHASE4_DEMO_RAW_DATA.cypher

Use the appropriate scripts to prepare the Neo4j database for the project or demonstration.

5. Start the Application
Normal Mode
npm start
Development Mode
npm run dev

Then open:

http://localhost:3000
🖥️ Main Features
📊 Dashboard

Provides the main interface for accessing the investigation system and its major modules.

👤 Entity Management

Allows investigators to enter and manage:

Persons
Cases
Phones
Vehicles
Addresses
Locations
🔗 Relationship Discovery

Analyzes stored entity information and identifies possible investigative associations.

🌳 Investigation Tree

Starts from a selected root entity and explores connected entities across multiple hops.

📈 Graph Visualization

Displays the discovered investigation network through an interactive graph.

🧠 AI Integration

Provides an architecture for integrating Ollama and local LLM-based processing into the investigation workflow.

🔬 Example Investigation

Suppose the database contains:

PERSON A
Phone: 9999999999
Vehicle: GJ01AB1234

and another record contains:

PERSON B
Phone: 9999999999

CrimiNet can identify the shared phone association:

┌──────────┐
│ Person A │
└────┬─────┘
     │
     ↓
┌──────────────┐
│ 9999999999   │
│    PHONE     │
└──────┬───────┘
       │
       ↓
┌──────────┐
│ Person B │
└──────────┘

If the same phone or another connected entity is associated with a case:

Person A
   ↓
Phone
   ↓
Person B
   ↓
Case
   ↓
Vehicle
   ↓
Person C

the investigator can continue exploring the connected network.

🎯 How CrimiNet Addresses the SIH Problem
Challenge	CrimiNet Approach
Fragmented investigation data	Structured entity management
Difficult relationship discovery	Runtime association discovery
Indirect connections	Multi-hop graph traversal
Complex criminal networks	Neo4j graph representation
Manual cross-referencing	Automated association discovery
Difficult network understanding	Investigation tree
Complex relationship visualization	Interactive D3.js graph
Unstructured data processing	Ollama + LLM integration
Advanced network analysis	Extensible graph-analysis architecture
🔄 From Raw Data to Investigation Intelligence

CrimiNet converts investigation information through multiple stages:

┌──────────────────────┐
│   Raw Investigation  │
│        Data          │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Entity Management  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│    Neo4j Graph DB    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Relationship         │
│ Discovery            │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Multi-Hop Traversal  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Investigation Tree   │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Interactive Graph    │
│ Visualization        │
└──────────────────────┘
🎯 Connection to the SIH Proposal

The SIH proposal describes the overall solution as:

Data Ingestion
      ↓
Entity Extraction
      ↓
Graph Construction
      ↓
Advanced Analysis
      ↓
Visualization

CrimiNet provides the graph-based investigation foundation for this pipeline.

The current implementation focuses on:

Entity Data
     ↓
Neo4j
     ↓
Relationship Discovery
     ↓
Multi-Hop Analysis
     ↓
Investigation Tree
     ↓
Visualization

The proposed AI layer can extend this system by automatically extracting entities and relationships from unstructured investigation documents.

🔮 Future Scope

The CrimiNet architecture can be extended with:

🤖 AI-based entity extraction
🔗 Automated relationship extraction
🧠 Advanced link prediction
📂 Cross-case network analysis
🗺️ Geographic proximity analysis
⏱️ Timeline analysis
📑 AI-assisted investigation summaries
📊 Advanced network analytics
🔌 Additional authorized data-source integration
🔐 Privacy & Responsible Use

CrimiNet is designed as an investigative intelligence and decision-support system.

A discovered graph connection represents an investigative association requiring further verification, not proof of criminal involvement.

For example:

Person A
   ↓
Phone
   ↓
Person B

does not, by itself, establish criminal involvement.

Any real-world deployment should include appropriate:

Authorization
Access control
Data protection
Privacy safeguards
Audit mechanisms
Human verification
Legal and regulatory compliance

AI-generated results should also be treated as analytical assistance and verified against reliable source evidence.

📈 Expected Impact
👮 Investigative Impact
Faster exploration of connected information
Easier discovery of indirect associations
Multi-hop investigation support
Better understanding of complex networks
💻 Technological Impact
Graph-based investigative architecture
AI-ready data pipeline
Interactive network visualization
Extensible analysis engine
📊 Operational Impact
Reduced dependency on manual cross-referencing
Structured investigation workflow
Centralized entity-based analysis
Improved visibility of connected information
📚 References

The project proposal references research and resources related to crime-data analytics, AI in policing, crime statistics and AI strategy.

IEEE Xplore — Crime Data Analysis Using Machine Learning Techniques
Google Scholar — Artificial Intelligence Applications in Indian Policing: Opportunities and Challenges
National Crime Records Bureau (NCRB) — Crime in India 2024
NITI Aayog — National Strategy for Artificial Intelligence
Indian Police Foundation — Smart Policing case studies
👥 Team Think Forge
CrimiNet

AI-Powered Criminal Network Analysis System

Developed for Smart India Hackathon

🔗 Repository

GitHub:
https://github.com/rudradesa/criminet

<div align="center">
⭐ CrimiNet

Turning fragmented investigation data into a connected intelligence graph.

Start from one entity. Explore the network. Discover the connections.

</div> ``
