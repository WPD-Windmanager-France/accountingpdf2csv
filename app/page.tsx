"use client";

import { useState, useRef } from "react";
import { Upload, Download, AlertCircle, CheckCircle, Info, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface FileResult {
  filename: string;
  data: any[];
  transaction_count: number;
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colonnes editables
  const editableColumns = ["JOURNAL", "GENERAL", "AUXILIAIRE"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setError(null);
      setSuccessMsg(null);
      setFileResults([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setError(null);
      setSuccessMsg(null);
      setFileResults([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const resetAll = () => {
    setFiles([]);
    setFileResults([]);
    setError(null);
    setSuccessMsg(null);
    setCurrentFileIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);
    setFileResults([]);
    setProcessingProgress({ current: 0, total: files.length });

    const results: FileResult[] = [];
    const errors: string[] = [];

    // Process files one by one to avoid Vercel timeout
    for (let i = 0; i < files.length; i++) {
      setProcessingProgress({ current: i + 1, total: files.length });

      const formData = new FormData();
      formData.append("files", files[i]);

      try {
        const response = await fetch("/api/process", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          if (result.errors && result.errors.length > 0) {
            errors.push(...result.errors);
          }
          if (result.files && result.files.length > 0) {
            results.push(...result.files);
          }
        } else {
          errors.push(`${files[i].name}: ${result.detail || "Erreur"}`);
        }
      } catch (err) {
        errors.push(`${files[i].name}: Erreur de connexion`);
        console.error(err);
      }
    }

    // Set final results
    if (errors.length > 0) {
      setError(errors.join(", "));
    }

    if (results.length > 0) {
      setFileResults(results);
      setSuccessMsg(`${results.length} fichier(s) traite(s) avec succes.`);
      setCurrentFileIndex(0);
    } else if (errors.length === 0) {
      setError("Aucune transaction trouvee.");
    }

    setIsProcessing(false);
    setProcessingProgress(null);
  };

  // Mettre a jour une cellule dans un fichier specifique
  const updateCell = (fileIndex: number, rowIndex: number, column: string, value: string) => {
    setFileResults((prev) => {
      const newResults = [...prev];
      const newData = [...newResults[fileIndex].data];
      newData[rowIndex] = { ...newData[rowIndex], [column]: value };
      newResults[fileIndex] = { ...newResults[fileIndex], data: newData };
      return newResults;
    });
  };

  // Generer et telecharger le CSV pour un fichier
  const downloadCsv = (fileResult: FileResult) => {
    if (fileResult.data.length === 0) return;

    const headers = Object.keys(fileResult.data[0]);
    const csvRows = [
      headers.join(";"),
      ...fileResult.data.map((row) =>
        headers.map((h) => row[h] ?? "").join(";")
      ),
    ];
    const csvContent = "\uFEFF" + csvRows.join("\r\n");

    const csvFilename = fileResult.filename.replace(/\.pdf$/i, ".csv");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", csvFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Telecharger tous les CSV
  const downloadAllCsv = () => {
    fileResults.forEach((fileResult) => {
      downloadCsv(fileResult);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 text-gray-900">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-center text-indigo-700">PDF to CSV</h1>
          <div className="relative group">
            <Info className="h-5 w-5 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Convertit vos releves bancaires PDF en fichier CSV pour import comptable
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div
          className={`border-2 border-dashed rounded-lg py-4 px-6 text-center transition cursor-pointer bg-white shadow-sm max-w-md mx-auto ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:bg-gray-100"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          aria-label="Zone de depot de fichiers PDF"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-base font-medium">
            {files.length > 0
              ? `${files.length} fichier(s) selectionne(s)`
              : "Glisser vos PDF ici ou cliquer"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Format PDF uniquement</p>
        </div>

        {/* Action Button */}
        {files.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              aria-label="Lancer le traitement des fichiers PDF"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {processingProgress
                    ? `Traitement ${processingProgress.current}/${processingProgress.total}...`
                    : "Traitement en cours..."}
                </>
              ) : (
                "Lancer le traitement"
              )}
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-green-700">
            <CheckCircle className="h-5 w-5 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Results - Single file with navigation */}
        {fileResults.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            {/* Header with navigation */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h2 className="font-semibold text-lg">{fileResults[currentFileIndex].filename}</h2>
                  <span className="text-sm text-gray-500">({fileResults[currentFileIndex].data.length} transactions)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCsv(fileResults[currentFileIndex])}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm"
                  >
                    <Download className="h-4 w-4" /> Telecharger CSV
                  </button>
                  {fileResults.length > 1 && (
                    <>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={downloadAllCsv}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow-sm text-sm"
                      >
                        <Download className="h-4 w-4" /> Tout ({fileResults.length})
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Navigation */}
              {fileResults.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentFileIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentFileIndex === 0}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    aria-label="Fichier precedent"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {fileResults.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentFileIndex(idx)}
                        aria-label={`Voir fichier ${idx + 1}`}
                        className={`w-3 h-3 rounded-full transition ${
                          idx === currentFileIndex ? "bg-indigo-600" : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentFileIndex((prev) => Math.min(fileResults.length - 1, prev + 1))}
                    disabled={currentFileIndex === fileResults.length - 1}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    aria-label="Fichier suivant"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <span className="text-sm text-gray-500 ml-2">
                    {currentFileIndex + 1} / {fileResults.length}
                  </span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {fileResults[currentFileIndex].data.length > 0 && Object.keys(fileResults[currentFileIndex].data[0]).map((header) => (
                      <th
                        key={header}
                        className={`px-4 py-3 text-left font-medium uppercase tracking-wider ${
                          editableColumns.includes(header)
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-gray-500"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {header}
                          {editableColumns.includes(header) && (
                            <div className="relative group inline-block">
                              <span className="inline-flex items-center justify-center w-4 h-4 text-xs bg-indigo-200 text-indigo-700 rounded-full cursor-help">?</span>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                Champ editable - cliquez pour modifier
                              </div>
                            </div>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fileResults[currentFileIndex].data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                      {Object.entries(row).map(([key, val]: [string, any], colIdx) => (
                        <td key={colIdx} className="px-4 py-2 whitespace-nowrap">
                          {editableColumns.includes(key) ? (
                            <input
                              type="text"
                              value={val || ""}
                              onChange={(e) => updateCell(currentFileIndex, rowIdx, key, e.target.value)}
                              maxLength={key === "JOURNAL" ? 3 : 17}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-indigo-50"
                            />
                          ) : (
                            <span className="text-gray-700">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reset button */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
              <button
                onClick={resetAll}
                className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                Traiter d&apos;autres fichiers
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
