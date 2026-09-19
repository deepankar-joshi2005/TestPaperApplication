export type TabKey = 'home' | 'tests' | 'affairs' | 'notes' | 'results' | 'profile';

export type PurchasableItemType = 'series' | 'notesSubject';

export type Route =
  | { name: 'tab'; tab: TabKey }
  | { name: 'seriesList'; category: string }
  | { name: 'testList'; seriesId: string }
  | { name: 'testInstructions'; testId: string }
  | { name: 'testTaking'; attemptId: string; testId: string }
  | { name: 'pdfTestTaking'; attemptId: string; testId: string }
  | { name: 'testResult'; attemptId: string }
  | { name: 'solutionReview'; attemptId: string }
  | { name: 'pdfAnswerKey'; attemptId: string }
  | { name: 'leaderboard'; testId: string }
  | { name: 'notesSubjectList'; category: string }
  | { name: 'noteList'; subjectId: string; subjectName: string }
  | { name: 'notePdfView'; title: string; pdfUrl: string }
  | { name: 'affairPdfView'; title: string; pdfUrl: string }
  | {
      name: 'paymentCheckout';
      itemType: PurchasableItemType;
      itemId: string;
      itemTitle: string;
      price: number;
    }
  | { name: 'editProfile' }
  | { name: 'notifications' }
  | { name: 'language' }
  | { name: 'help' };

export type Nav = {
  push: (route: Route) => void;
  pop: () => void;
  replace: (route: Route) => void;
  resetToTab: (tab: TabKey) => void;
};

export const routeTab = (route: Route): TabKey | null => {
  switch (route.name) {
    case 'tab':
      return route.tab;
    case 'seriesList':
    case 'testList':
      return 'tests';
    case 'notesSubjectList':
    case 'noteList':
      return 'notes';
    case 'testResult':
    case 'leaderboard':
      return 'results';
    default:
      return null;
  }
};

export const showsTabBar = (route: Route): boolean => routeTab(route) !== null;
