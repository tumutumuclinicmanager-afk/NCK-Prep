# Implementation Plan: Streamlined Exam & Answer Sheet Uploads

## User Review Required

> [!IMPORTANT]
> This plan outlines the architecture for simplified batch uploading of exams and answer sheets for educators and administrators. Please review the proposed features and approve to proceed with implementation.

- **Batch CSV/Excel Uploader**: Quick spreadsheet template for bulk question importing.
- **AI-Powered Document & PDF Parser**: Automated extraction of questions and answer keys from raw past paper PDFs.
- **Drag-and-Drop Interface**: Streamlined UI for uploading and reviewing exam packages before publishing.

---

## Proposed Changes

### 1. Spreadsheet & CSV Batch Uploader
- Provide a downloadable CSV/Excel template with columns: `Question Stem`, `Question Type`, `Option A`, `Option B`, `Option C`, `Option D`, `Correct Answer`, `Rationale`, and `NCK Domain`.
- Add bulk file drop zone in the Upload Exams workflow (`src/components/staff/UploadExams.tsx`).

### 2. Enhanced AI Document Parser
- Upgrade `src/lib/pdfExtractor.ts` to automatically detect answer keys at the bottom of uploaded past paper documents and match them to questions.

### 3. Educator Review Dashboard
- Add pre-publish validation summary showing total questions parsed, category breakdown, and missing fields before publishing to the live Exam Bank.

---

## Verification Plan

### Automated Tests
- Test parsing of sample CSV and PDF exam files.
- Verify correct database insertion into Firestore.

### Manual Verification
- Upload a test batch via the staff portal and confirm questions appear instantly in the Exam Bank.
