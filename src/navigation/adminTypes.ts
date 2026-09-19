export type AdminTabKey = 'home' | 'tests' | 'affairs' | 'students' | 'results' | 'more';

export type AdminRoute =
  | { name: 'tab'; tab: AdminTabKey }
  | { name: 'categories' }
  | { name: 'addCategory'; categoryId?: string }
  | { name: 'categoryDetail'; categoryId: string }
  | { name: 'seriesList' }
  | { name: 'createSeriesStep1'; seriesId?: string; category?: string }
  | { name: 'createSeriesStep2'; seriesId: string }
  | { name: 'seriesPreview'; seriesId: string }
  | { name: 'seriesPublishSuccess'; seriesId: string }
  | { name: 'seriesTests'; seriesId: string }
  | { name: 'createTestStep1'; seriesId: string; testId?: string }
  | { name: 'createTestStep2'; testId: string }
  | { name: 'manageQuestions'; testId: string }
  | { name: 'uploadTestPdf'; testId: string }
  | { name: 'questionBank'; testId?: string }
  | { name: 'addQuestion'; testId?: string; questionId?: string; subject?: string }
  | { name: 'questionPreview'; questionId: string; testId?: string }
  | { name: 'importQuestions'; testId: string }
  | { name: 'subjectSections'; testId: string }
  | { name: 'studentPreview'; testId: string }
  | { name: 'publishTest'; testId: string }
  | { name: 'publishSuccess'; testId: string }
  | { name: 'studentDetail'; studentId: string }
  | { name: 'resultsForTest'; testId: string; testTitle: string }
  | { name: 'notesCategoryList' }
  | { name: 'notesSubjects'; category: string }
  | { name: 'addNotesSubject'; category: string; subjectId?: string }
  | { name: 'notesList'; subjectId: string; subjectName: string }
  | { name: 'addNote'; subjectId: string; noteId?: string }
  | { name: 'adminAddAffair'; affairId?: string }
  | { name: 'adminAffairPdfView'; title: string; pdfUrl: string }
  | { name: 'payments' };

export type AdminNav = {
  push: (route: AdminRoute) => void;
  pop: () => void;
  replace: (route: AdminRoute) => void;
  resetToTab: (tab: AdminTabKey) => void;
};

const TESTS_TAB_ROUTES = new Set<AdminRoute['name']>([
  'categories',
  'addCategory',
  'categoryDetail',
  'seriesList',
  'createSeriesStep1',
  'createSeriesStep2',
  'seriesPreview',
  'seriesPublishSuccess',
  'seriesTests',
  'createTestStep1',
  'createTestStep2',
  'manageQuestions',
  'uploadTestPdf',
  'questionBank',
  'addQuestion',
  'questionPreview',
  'importQuestions',
  'subjectSections',
  'studentPreview',
  'publishTest',
  'publishSuccess',
]);

const NOTES_TAB_ROUTES = new Set<AdminRoute['name']>([
  'notesCategoryList',
  'notesSubjects',
  'notesList',
]);

const NO_TAB_BAR_ROUTES = new Set<AdminRoute['name']>([
  'addCategory',
  'createSeriesStep1',
  'createSeriesStep2',
  'createTestStep1',
  'createTestStep2',
  'addQuestion',
  'addNotesSubject',
  'addNote',
  'adminAddAffair',
  'adminAffairPdfView',
]);

export const adminRouteTab = (route: AdminRoute): AdminTabKey | null => {
  if (route.name === 'tab') return route.tab;
  if (route.name === 'studentDetail') return 'students';
  if (route.name === 'resultsForTest') return 'results';
  if (route.name === 'payments') return 'more';
  if (TESTS_TAB_ROUTES.has(route.name)) return 'tests';
  if (NOTES_TAB_ROUTES.has(route.name)) return 'home';
  if (route.name === 'adminAddAffair' || route.name === 'adminAffairPdfView') return 'affairs';
  return null;
};

export const adminShowsTabBar = (route: AdminRoute): boolean => !NO_TAB_BAR_ROUTES.has(route.name);
