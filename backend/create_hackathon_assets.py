import os
import matplotlib.pyplot as plt
import networkx as nx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor as PptxRGBColor

# 1. Generate Architecture Diagram using Matplotlib
def generate_diagram(filepath):
    import requests
    import base64
    
    # Create mermaid syntax
    mermaid_code = """
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
    """
    
    # Encode to base64
    encoded = base64.b64encode(mermaid_code.encode('utf-8')).decode('utf-8')
    url = f"https://mermaid.ink/img/{encoded}?type=png&bgColor=!white"
    
    # Download
    print(f"Downloading diagram from {url}")
    response = requests.get(url)
    if response.status_code == 200:
        with open(filepath, 'wb') as f:
            f.write(response.content)
    else:
        print(f"Failed to generate diagram! {response.status_code}")


# 2. Generate DOCX
def create_docx(diagram_path, doc_path):
    doc = Document()
    
    # Title
    title = doc.add_heading("SehatSaathi AI - Alibaba Cloud Hackathon Project", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_heading("1. Executive Summary", level=1)
    doc.add_paragraph(
        "SehatSaathi AI is an enterprise-grade, comprehensive healthcare intelligence platform designed "
        "to bridge the gap between clinical diagnostics, telemedicine, and pharmaceutical accessibility. "
        "It leverages a modular microservices architecture, integrating advanced optical character recognition (OCR), "
        "high-precision computer vision (CV) diagnostics, and localized healthcare e-commerce."
    )
    
    doc.add_heading("2. System Architecture", level=1)
    doc.add_paragraph("The diagram below illustrates the fully decoupled serverless architecture deployed on Vercel:")
    doc.add_picture(diagram_path, width=Inches(6.0))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_heading("3. Core Modules", level=1)
    
    doc.add_heading("3.1 Medical Image Analysis", level=2)
    doc.add_paragraph(
        "The imaging engine accepts multi-modal uploads (MRI, X-Ray, Dermatological Scans). "
        "It utilizes an intelligent modality router and cascades into highly optimized mathematical "
        "heuristic evaluations (Centroid-Distance Mapping) when deep learning frameworks are restricted."
    )
    
    doc.add_heading("3.2 Prescription Tokenization (OCR)", level=2)
    doc.add_paragraph(
        "Handwritten prescriptions are upscaled, adaptively binarized, and parsed via cloud-optimized "
        "optical character recognition. The NLP pipeline performs dynamic fuzzy matching against a localized "
        "database of pharmaceuticals, instantly routing molecules to the e-commerce cart."
    )
    
    doc.add_heading("3.3 Intelligent Symptom NLP", level=2)
    doc.add_paragraph(
        "Utilizes statistical correlations over massive medical datasets to map patient-described physical "
        "ailments to highly probable disease vectors, delivering targeted dietary and preventative recommendations."
    )
    
    doc.add_heading("3.4 Pharmaceutical E-Commerce Engine", level=2)
    doc.add_paragraph(
        "A low-latency, Appwrite-backed market ecosystem allowing patients to instantly acquire "
        "medications prescribed or recommended by the AI engines."
    )
    
    doc.add_heading("4. Deployment & Infrastructure", level=1)
    doc.add_paragraph(
        "To ensure maximum scalability and zero operational overhead, the entire Python backend and Next.js "
        "frontend are unified into a single Vercel deployment structure via dynamic rewrite rules in vercel.json."
    )
    
    doc.save(doc_path)

# 3. Generate PPTX
def create_pptx(diagram_path, ppt_path):
    prs = Presentation()
    
    # Slide 1: Title
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    title.text = "SehatSaathi AI"
    subtitle.text = "Alibaba Cloud Hackathon Presentation\nIntelligent Healthcare Ecosystem"
    
    # Slide 2: Problem & Solution
    bullet_slide_layout = prs.slide_layouts[1]
    slide = prs.slides.add_slide(bullet_slide_layout)
    shapes = slide.shapes
    shapes.title.text = "The Healthcare Gap"
    body_shape = shapes.placeholders[1]
    tf = body_shape.text_frame
    tf.text = "Lack of accessible, immediate diagnostic tools."
    p = tf.add_paragraph()
    p.text = "Solution: A unified portal for CV diagnostics, OCR, and Pharmacy."
    p.level = 1
    p = tf.add_paragraph()
    p.text = "Architecture: Vercel Serverless (Next.js + FastAPI)."
    p.level = 1
    
    # Slide 3: Architecture Diagram
    blank_slide_layout = prs.slide_layouts[5]
    slide = prs.slides.add_slide(blank_slide_layout)
    slide.shapes.title.text = "System Architecture"
    slide.shapes.add_picture(diagram_path, PptxInches(1), PptxInches(1.5), width=PptxInches(8))
    
    # Slide 4: Key Modules
    slide = prs.slides.add_slide(bullet_slide_layout)
    slide.shapes.title.text = "Core Intelligence Modules"
    tf = slide.shapes.placeholders[1].text_frame
    tf.text = "1. Medical Image Analysis (Multi-Modal CV & Heuristics)"
    p = tf.add_paragraph()
    p.text = "2. Optical Prescription Parser (Cloud OCR + NLP Matching)"
    p = tf.add_paragraph()
    p.text = "3. Predictive Symptom Analysis (Statistical ML)"
    p = tf.add_paragraph()
    p.text = "4. Integrated Pharmacy Ecosystem"
    
    prs.save(ppt_path)

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    diagram = os.path.join(base_dir, "architecture_diagram.png")
    docx_file = os.path.join(base_dir, "SehatSaathi_AI_Hackathon_Doc.docx")
    pptx_file = os.path.join(base_dir, "SehatSaathi_AI_Hackathon_Presentation.pptx")
    
    print("Generating Architecture Diagram...")
    generate_diagram(diagram)
    
    print("Generating DOCX...")
    create_docx(diagram, docx_file)
    
    print("Generating PPTX...")
    create_pptx(diagram, pptx_file)
    
    print("All assets generated successfully!")
