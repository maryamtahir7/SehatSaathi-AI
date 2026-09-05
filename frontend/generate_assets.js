/* eslint-disable */
const fs = require('fs');
const https = require('https');
const docx = require('docx');
const pptxgen = require('pptxgenjs');

async function downloadDiagram() {
  return new Promise((resolve, reject) => {
    const mermaidCode = `
    graph TD
        subgraph Vercel_Edge [Vercel Global Edge Network]
            Client[Next.js Client Application] -->|API Requests| Gateway[Vercel Serverless Gateway]
        end
        
        subgraph Vercel_Serverless [Python Serverless Backend]
            Gateway --> Core[FastAPI /api/index.py]
            Core --> CV[Medical Imaging & Pathological CV Engine]
            Core --> OCR[Prescription Tokenizer OCR]
            Core --> NLP[Intelligent Symptom NLP]
        end
        
        subgraph Models [Machine Learning Models & Data]
            CV --> H[Centroid-Distance Heuristics]
            OCR --> C[Cloud OCR Integration]
            NLP --> DB[(Appwrite BaaS / Marketplace DB)]
        end
        
        classDef primary fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
        classDef backend fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
        classDef database fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
        
        class Client,Gateway primary;
        class Core,CV,OCR,NLP backend;
        class H,C,DB database;
    `;
    
    const encoded = Buffer.from(mermaidCode).toString('base64');
    const url = `https://mermaid.ink/img/${encoded}?type=png&bgColor=!white`;
    
    const file = fs.createWriteStream('architecture_diagram.png');
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink('architecture_diagram.png');
      reject(err);
    });
  });
}

async function createDocx() {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } = docx;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "SehatSaathi AI - Alibaba Cloud Hackathon Project",
            heading: HeadingLevel.TITLE,
            alignment: docx.AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: "1. Executive Summary", bold: true, size: 28 })],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "SehatSaathi AI is an enterprise-grade, comprehensive healthcare intelligence platform designed to bridge the gap between clinical diagnostics, telemedicine, and pharmaceutical accessibility. It leverages a modular microservices architecture, integrating advanced optical character recognition (OCR), high-precision computer vision (CV) diagnostics, and localized healthcare e-commerce."
          }),
          new Paragraph({
            children: [new TextRun({ text: "2. System Architecture", bold: true, size: 28 })],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "The diagram below illustrates the fully decoupled serverless architecture deployed on Vercel:"
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: fs.readFileSync("architecture_diagram.png"),
                transformation: { width: 600, height: 400 }
              })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { before: 200, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "3. Core Modules", bold: true, size: 28 })],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "3.1 Medical Image Analysis", bold: true, size: 24 })],
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: "The imaging engine accepts multi-modal uploads (MRI, X-Ray, Dermatological Scans). It utilizes an intelligent modality router and cascades into highly optimized mathematical heuristic evaluations (Centroid-Distance Mapping) when deep learning frameworks are restricted."
          }),
          new Paragraph({
            children: [new TextRun({ text: "3.2 Prescription Tokenization (OCR)", bold: true, size: 24 })],
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: "Handwritten prescriptions are upscaled, adaptively binarized, and parsed via cloud-optimized optical character recognition. The NLP pipeline performs dynamic fuzzy matching against a localized database of pharmaceuticals, instantly routing molecules to the e-commerce cart."
          }),
          new Paragraph({
            children: [new TextRun({ text: "3.3 Intelligent Symptom NLP", bold: true, size: 24 })],
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: "Utilizes statistical correlations over massive medical datasets to map patient-described physical ailments to highly probable disease vectors, delivering targeted dietary and preventative recommendations."
          }),
          new Paragraph({
            children: [new TextRun({ text: "4. Deployment & Infrastructure", bold: true, size: 28 })],
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "To ensure maximum scalability and zero operational overhead, the entire Python backend and Next.js frontend are unified into a single Vercel deployment structure via dynamic rewrite rules in vercel.json."
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("SehatSaathi_AI_Hackathon_Doc.docx", buffer);
  console.log("DOCX generated.");
}

async function createPptx() {
  let pres = new pptxgen();

  // Title Slide
  let slide1 = pres.addSlide();
  slide1.addText("SehatSaathi AI", { x: 1, y: 1.5, w: 8, h: 1, fontSize: 44, bold: true, align: "center", color: "10b981" });
  slide1.addText("Alibaba Cloud Hackathon Presentation\nIntelligent Healthcare Ecosystem", { x: 1, y: 2.5, w: 8, h: 1, fontSize: 24, align: "center", color: "333333" });

  // Problem Slide
  let slide2 = pres.addSlide();
  slide2.addText("The Healthcare Gap", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: "0f172a" });
  slide2.addText([
    { text: "Lack of accessible, immediate diagnostic tools.", options: { bullet: true, breakLine: true } },
    { text: "Solution: A unified portal for CV diagnostics, OCR, and Pharmacy.", options: { bullet: true, breakLine: true } },
    { text: "Architecture: Vercel Serverless (Next.js + FastAPI).", options: { bullet: true } }
  ], { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 24, color: "333333" });

  // Architecture Slide
  let slide3 = pres.addSlide();
  slide3.addText("System Architecture", { x: 0.5, y: 0.2, w: 9, h: 0.8, fontSize: 32, bold: true, color: "0f172a" });
  slide3.addImage({ path: "architecture_diagram.png", x: 1, y: 1.2, w: 8, h: 4 });

  // Modules Slide
  let slide4 = pres.addSlide();
  slide4.addText("Core Intelligence Modules", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: "0f172a" });
  slide4.addText([
    { text: "1. Medical Image Analysis (Multi-Modal CV & Heuristics)", options: { bullet: true, breakLine: true } },
    { text: "2. Optical Prescription Parser (Cloud OCR + NLP Matching)", options: { bullet: true, breakLine: true } },
    { text: "3. Predictive Symptom Analysis (Statistical ML)", options: { bullet: true, breakLine: true } },
    { text: "4. Integrated Pharmacy Ecosystem", options: { bullet: true } }
  ], { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 24, color: "333333" });

  await pres.writeFile({ fileName: "SehatSaathi_AI_Hackathon_Presentation.pptx" });
  console.log("PPTX generated.");
}

async function run() {
  console.log("Downloading architecture diagram...");
  await downloadDiagram();
  console.log("Creating DOCX...");
  await createDocx();
  console.log("Creating PPTX...");
  await createPptx();
  console.log("All assets generated successfully!");
}

run();
