// src/types/index.ts
export interface Project {
  id: string;
  title: string;
  description: string;
}


export interface PdfFile {
  id: string;
  filename: string;
  download_url: string;
}

export interface Question {
  id: string; // Assuming questions will also have an ID from the API
  q: string;
  a: string;
}