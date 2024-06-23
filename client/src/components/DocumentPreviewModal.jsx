import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const DocumentPreviewModal = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="bg-white rounded-lg shadow-lg p-4 z-10 max-w-3xl w-full">
        <div className="flex justify-end">
          <button className="text-red-500 hover:text-red-700" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="w-full h-96">
          <Worker
            workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`}
          >
            <Viewer fileUrl={url} />
          </Worker>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
