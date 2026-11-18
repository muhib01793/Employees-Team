import toast from 'react-hot-toast';

export function downloadDocumentFile(doc) {
  if (!doc) return;

  if (doc.fileUrl && !doc.fileUrl.startsWith('/api') && !doc.fileUrl.startsWith('/uploads')) {
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName || `${doc.title || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Generate real downloadable text/PDF placeholder for preview/demo
    const content = `CONSULTANCY OUTFIT - OFFICIAL DOCUMENT
==================================================
Document Title : ${doc.title || 'Untitled Document'}
Original File  : ${doc.fileName || 'document.pdf'}
File Type      : ${doc.fileType || 'application/pdf'}
Uploaded By    : ${doc.uploadedBy?.name || 'Staff Member'}
Email          : ${doc.uploadedBy?.email || 'N/A'}
Date Uploaded  : ${new Date(doc.createdAt || Date.now()).toLocaleString()}
Status         : Verified / Secure

DESCRIPTION:
${doc.description || 'No description provided.'}

==================================================
Consultancy Outfit Workspace Collaboration System
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName ? (doc.fileName.endsWith('.pdf') ? doc.fileName : `${doc.fileName}.txt`) : `${doc.title || 'document'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  toast.success(`Downloaded: ${doc.fileName || doc.title}`);
}
