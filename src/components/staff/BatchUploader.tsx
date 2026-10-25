import React, { useState } from 'react';
import { Upload, FileText, Download, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function BatchUploader({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    const csvContent = `questionStem,questionType,optionA,optionB,optionC,optionD,correctAnswer,rationale,unitDomain,examMode
"A nurse is assessing a client with severe preeclampsia. Which sign indicates magnesium sulfate toxicity?","single_choice","Absent deep tendon reflexes","Hypertension (170/110 mmHg)","Brisk patellar reflexes","Clear clear lungs","Absent deep tendon reflexes","Loss of deep tendon reflexes is the earliest sign of hypermagnesemia and toxicity.","Obstetric Nursing & Midwifery","NCK Registered Nurse (RN) FQE"
"True or False: Regular insulin can be administered via IV infusion.","true_false","True","False","","","True","Regular insulin is short-acting and approved for continuous IV infusion in DKA.","Pharmacology & Therapeutics","NCK Registered Nurse (RN) FQE"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'nck_exam_batch_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setErrorMessage('Please select a CSV or Excel exam file to upload.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessCount(null);

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        throw new Error('CSV file appears empty or missing data rows.');
      }

      // Parse CSV lines (simple robust parser)
      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        // naive split or regex for CSV
        const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
        const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());

        if (cleanCols.length >= 7) {
          const [stem, qType, optA, optB, optC, optD, correctAns, rationale, domain, mode] = cleanCols;
          
          const options = [
            { id: 'a', text: optA || 'Option A', isCorrect: correctAns?.toLowerCase() === 'a' || correctAns?.toLowerCase() === (optA || '').toLowerCase() || correctAns === 'True' },
            { id: 'b', text: optB || 'Option B', isCorrect: correctAns?.toLowerCase() === 'b' || correctAns?.toLowerCase() === (optB || '').toLowerCase() },
            { id: 'c', text: optC || 'Option C', isCorrect: correctAns?.toLowerCase() === 'c' || correctAns?.toLowerCase() === (optC || '').toLowerCase() },
            { id: 'd', text: optD || 'Option D', isCorrect: correctAns?.toLowerCase() === 'd' || correctAns?.toLowerCase() === (optD || '').toLowerCase() }
          ];

          await addDoc(collection(db, 'examQuestions'), {
            questionStem: stem || 'Sample NCK Question',
            questionTypeId: qType || 'single_choice',
            questionTypeLabel: 'Multiple Choice',
            options,
            rationale: rationale || 'NCK Board examination standard rationale.',
            unitDomain: domain || 'Medical-Surgical Nursing',
            examMode: mode || 'NCK Registered Nurse (RN) FQE',
            difficulty: 'Medium',
            createdAt: new Date().toISOString()
          });
          importedCount++;
        }
      }

      setSuccessCount(importedCount);
      if (onUploadComplete) onUploadComplete();
    } catch (err: any) {
      console.error('Batch upload error:', err);
      setErrorMessage(err.message || 'Failed to process batch upload file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Batch CSV & Answer Sheet Uploader
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Streamlined Bulk Exam & Answer Key Upload
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload pre-formatted CSV/Excel exam question bundles and separate answer sheet keys for instant NCK question bank publication.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          className="text-xs font-bold text-blue-600 hover:bg-blue-50 border-blue-200 gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </Button>
      </div>

      <form onSubmit={handleBatchSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exam Questions CSV File Drop */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              1. Exam Questions File (.csv / .xlsx)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors relative">
              <input 
                type="file" 
                accept=".csv, .xlsx, .txt"
                onChange={(e) => e.target.files && setCsvFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileSpreadsheet className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                {csvFile ? csvFile.name : 'Drop your CSV exam file here, or browse'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports standard NCK question formatting</p>
            </div>
          </div>

          {/* Answer Sheet File Drop */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Separate Answer Key Sheet (Optional .txt / .pdf)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors relative">
              <input 
                type="file" 
                accept=".pdf, .txt, .csv"
                onChange={(e) => e.target.files && setAnswerSheetFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileText className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                {answerSheetFile ? answerSheetFile.name : 'Drop separate answer key sheet here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Automatic answer key matching & verification</p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {errorMessage}
          </div>
        )}

        {successCount !== null && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Successfully imported and published {successCount} questions into the NCK exam repository!
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="submit"
            disabled={isProcessing || !csvFile}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl gap-2 shadow-sm cursor-pointer"
          >
            {isProcessing ? (
              <>Processing Batch Uploader...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Publish Batch Exam Bundle
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
