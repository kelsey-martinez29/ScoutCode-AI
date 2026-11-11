// Scaffold for LATER counselor-side filling of the user-supplied 8-page workbook PDF.
// The third-party PDF is NOT bundled or rehosted. Field names must be filled in once the
// counselor supplies their own copy and the form fields are inspected (e.g. with pdf-lib).
export type PdfFieldMap = { questionId?: string; signoffId?: string; pdfField: string | null; page: number };
export const WORKBOOK_FIELD_MAP: PdfFieldMap[] = [
  { questionId: "1a.q1", pdfField: null, page: 1 },
  { questionId: "1b.q1", pdfField: null, page: 1 },
  { questionId: "2a.q1", pdfField: null, page: 2 },
  { questionId: "3a.q1", pdfField: null, page: 3 },
  { questionId: "4a.q1", pdfField: null, page: 4 },
  { questionId: "5a.q1", pdfField: null, page: 5 },
  { questionId: "6.q1", pdfField: null, page: 7 },
];
// Rule: only map saved Scout answers and counselor sign-offs. Never fabricate answers or signatures.