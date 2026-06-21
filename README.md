# SimpleMed — AI Medical Report Simplifier

SimpleMed is an AI-powered tool that converts complex medical reports (PDFs or images of lab reports) into plain, easy-to-understand language — complete with general wellness suggestions. It supports **12 Indian languages**, so users can get their reports explained in the language they're most comfortable with.

Built using **n8n**, **OpenAI (GPT-4o)**, and a lightweight **HTML/CSS/JavaScript** frontend.

---

## Overview

Medical reports are often filled with technical terms, abbreviations, and numbers that are hard for the average person to understand. SimpleMed bridges this gap by:

1. Accepting a medical report (PDF or image) from the user
2. Extracting and analyzing the content using AI
3. Generating a simplified summary with key findings, explanations, and wellness tips
4. Returning the response in the user's preferred language — with optional text-to-speech playback

---

## Features

- **File Upload** — Drag-and-drop or click to upload PDF, JPG, PNG, or WEBP medical reports (up to 20 MB)
- **AI-Powered Simplification** — Uses GPT-4o to translate medical jargon into plain language
- **Structured Output** — Includes a summary, key findings, abnormal results, lifestyle suggestions, and a "when to see a doctor" section
- **Multilingual Support** — Get results in English, Hindi, Marathi, Tamil, Telugu, Punjabi, Kannada, Bengali, Gujarati, Malayalam, Urdu, or Odia
- **Smart Routing** — Automatically detects whether the uploaded file is a PDF or an image and processes it accordingly
- **Error Handling** — Friendly fallback messages if file validation or AI processing fails
- **Copy & Download** — Easily copy the result to clipboard or download it as a text file
- **Privacy-Focused** — Files are not stored permanently; they are processed and discarded

---

## How It Works

```
User uploads file + selects language
        │
        ▼
  Frontend (HTML/CSS/JS)
        │
        ▼  sends file via webhook (multipart/form-data)
  n8n Workflow
        │
   ┌────┴─────┐
   │  Validate │ → No file? → Return error message
   │   file    │
   └────┬─────┘
        │
   ┌────┴─────┐
   │ PDF or    │
   │ Image?    │
   └────┬─────┘
   PDF  │   Image
   ┌────┴───┐  ┌──────────────┐
   │Extract  │  │ Analyze Image │
   │  Text   │  │  (GPT-4o)     │
   └────┬───┘  └──────┬───────┘
        └──────┬──────┘
               ▼
        AI Agent (GPT-4o)
   Simplifies report + generates
   wellness suggestions in the
   selected language
               │
               ▼
        Output Validation
   ┌──────┬────────────┐
 Success           Failure
   │                   │
   ▼                   ▼
Return result    Return friendly
to frontend       error message
```

---

## Tech Stack

| Layer            | Technology                          |
|------------------|--------------------------------------|
| Frontend         | HTML, CSS, Vanilla JavaScript         |
| Workflow Engine  | n8n (cloud or self-hosted)            |
| AI Model         | OpenAI GPT-4o / GPT-4o-mini           |
| File Handling    | n8n Extract from File, OpenAI Vision  |

---

## Project Structure

```
├── index.html                          # Frontend UI
├── style.css                           # Styling (dark theme)
├── script.js                           # Frontend logic + webhook integration
└── Ai_Medical_Report_Simplifier.json   # n8n workflow (import into n8n)
```

---

## Setup Instructions

### 1. Import the n8n Workflow

1. Log in to your [n8n](https://n8n.io) instance (cloud or self-hosted)
2. Go to **Workflows → Import from File**
3. Upload `Ai_Medical_Report_Simplifier.json`
4. Open the **OpenAI Chat Model** and **Analyze Image** nodes and connect your own **OpenAI API credential**
5. Activate the workflow and copy the **Production Webhook URL**

### 2. Configure the Frontend

1. Open `script.js`
2. Set the `WEBHOOK_URL` constant to your n8n production webhook URL:

```javascript
const WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/medical-report';
```

### 3. Run Locally or Deploy

- **Locally** — simply open `index.html` in your browser
- **GitHub Pages** — push the frontend files to a repository and enable GitHub Pages in repo settings to get a live URL

---

## Workflow Details (n8n)

The workflow consists of the following key nodes:

- **Webhook** — Receives the uploaded file and form data (file, language)
- **File Validation** — Checks whether a valid file was attached
- **PDF/Image (Switch)** — Routes the file based on its MIME type
- **Extract from File** — Extracts text from PDF reports
- **Analyze Image** — Uses GPT-4o Vision to extract structured data from image-based reports
- **AI Agent** — Core node that simplifies the report and generates wellness suggestions in the selected language, using a detailed system prompt
- **OpenAI Chat Model** — Language model (GPT-4o-mini) powering the AI Agent
- **Output Validation** — Checks if the AI Agent produced a valid output
- **Respond to Webhook (x3)** — Returns the final result or an appropriate error message to the frontend

---

## Supported Languages

English · Hindi · Marathi · Tamil · Telugu · Punjabi · Kannada · Bengali · Gujarati · Malayalam · Urdu · Odia

---

## Disclaimer

SimpleMed is intended for **informational and educational purposes only**. It does not provide medical diagnoses and should not replace professional medical advice. Always consult a qualified healthcare professional regarding any medical concerns.

---

## Future Improvements

- Follow-up Q&A chat based on the uploaded report
- Report history and trend tracking across multiple uploads
- Text-to-speech support for listening to simplified reports
- PDF export of the simplified report

---

*Built with passion by [Ayush Sail](https://github.com/ayushsail)*
