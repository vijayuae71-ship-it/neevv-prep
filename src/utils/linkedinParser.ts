import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

export interface LinkedInProfile {
  name: string;
  headline: string;
  summary: string;
  experience: string;
  skills: string[];
  education: string;
  fullText: string;
}

export async function parseLinkedInPDF(file: File): Promise<LinkedInProfile> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
  }

  // LinkedIn PDFs typically have the name at the very top
  const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Name is usually the first meaningful line
  const name = lines[0] || '';
  
  // Headline is usually the second line (e.g., "Senior Manager at Deloitte")
  const headline = lines.length > 1 ? lines[1] : '';
  
  // Extract sections by common LinkedIn PDF headers
  const sectionHeaders = ['Summary', 'Experience', 'Education', 'Skills', 'Languages', 'Certifications', 'Honors', 'Projects', 'Volunteer', 'Courses'];
  
  let summary = '';
  let experience = '';
  let education = '';
  let skillsRaw = '';
  
  // Find section boundaries
  const sectionPositions: { name: string; pos: number }[] = [];
  for (const header of sectionHeaders) {
    const regex = new RegExp(`\\b${header}\\b`, 'i');
    const idx = fullText.search(regex);
    if (idx >= 0) {
      sectionPositions.push({ name: header.toLowerCase(), pos: idx });
    }
  }
  sectionPositions.sort((a, b) => a.pos - b.pos);
  
  for (let i = 0; i < sectionPositions.length; i++) {
    const start = sectionPositions[i].pos;
    const end = i + 1 < sectionPositions.length ? sectionPositions[i + 1].pos : fullText.length;
    const content = fullText.slice(start, end).trim();
    
    switch (sectionPositions[i].name) {
      case 'summary': summary = content.replace(/^Summary\s*/i, '').trim(); break;
      case 'experience': experience = content.replace(/^Experience\s*/i, '').trim(); break;
      case 'education': education = content.replace(/^Education\s*/i, '').trim(); break;
      case 'skills': skillsRaw = content.replace(/^Skills\s*/i, '').trim(); break;
    }
  }
  
  // Parse skills - LinkedIn PDFs list them one per line or comma-separated
  const skills = skillsRaw
    ? skillsRaw.split(/[,\n·•]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 50).slice(0, 10)
    : [];
  
  return {
    name: name.substring(0, 100),
    headline: headline.substring(0, 200),
    summary: summary.substring(0, 1000),
    experience: experience.substring(0, 2000),
    skills,
    education: education.substring(0, 500),
    fullText,
  };
}
