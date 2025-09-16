Digital Tourist ID using Polygon ID (Hackathon Proof-of-Concept)This project is a proof-of-concept demonstrating a decentralized identity system for tourists using Polygon ID's Self-Sovereign Identity (SSI) framework.It consists of two main components:Issuer Service: A Node.js/Express backend that simulates the issuance of a "Digital Tourist ID" as a Verifiable Credential (VC).Verifier Demo: A simple HTML/JavaScript frontend that acts as a police check-post, capable of verifying the authenticity of the tourist's ID.How it WorksIssuance: A tourist provides their details to the "Ministry of Tourism" (our Issuer Service). The service generates a JSON object representing the Verifiable Credential, including a mock cryptographic signature.Presentation (Simulated): The tourist would typically receive this VC in their digital wallet (e.g., Polygon ID Wallet). For this demo, the Verifier will fetch this credential directly from the issuer.Verification: The "Police Check-post" (our Verifier Demo) scans a QR code (simulated by a button click). It receives the VC and sends it to an endpoint on the Issuer service (/verify-id) to check its integrity and authenticity. The verifier confirms that the data hasn't been tampered with.Folder Structure.
├── issuer-service/   # Backend Node.js/Express App
│   ├── package.json
│   └── index.js
└── verifier-demo/      # Frontend HTML/JS App
    └── index.html
Setup and Running the Project1. Issuer Service (Backend)Prerequisites: Node.js and npm installed.# Navigate to the issuer service directory
cd issuer-service

# Install dependencies
npm install

# Start the server
node index.js
The server will start on http://localhost:3000.2. Verifier Demo (Frontend)Prerequisites: A modern web browser.Navigate to the verifier-demo directory.Open the index.html file directly in your web browser (e.g., by double-clicking it).You can now use the "Scan QR Code" button to simulate the verification process.Task 1: Schema DefinitionThe schema for the DigitalTouristID Verifiable Credential is defined within the issuer service and includes the following fields:touristName: Full name of the tourist.issuingAuthority: The entity that issued the ID (e.g., "Ministry of Tourism").documentHash: A mock SHA-256 hash of a source document like a passport.validFrom: The start date of the trip.validUntil: The end date of the trip.emergencyContact: An emergency contact number.issuedAt: Timestamp of when the credential was issued.signature: A mock signature to represent cryptographic proof of authenticity.