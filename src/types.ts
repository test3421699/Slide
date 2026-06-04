export interface SlideItem {
  title: string;
  bulletPoints: string[];
  backgroundColor: string; // Background color hex code (e.g. #0F172A)
  isDark: boolean; // Whether the background requires white text for readable contrast
  presenterNotes?: string; // Speaker notes to display in presenter mode
}

export interface PresentationData {
  presentationTitle: string;
  slides: SlideItem[];
}
