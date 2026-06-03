import { Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.js';
import { LessonsIndexPage } from './pages/LessonsIndexPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { PreviewDashboard } from './pages/PreviewDashboard.js';
import { LessonPlayer } from './lesson-player/LessonPlayer.js';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/lessons" element={<LessonsIndexPage />} />
      <Route path="/lessons/:lessonId" element={<LessonPlayer />} />
      <Route path="/lessons/:lessonId/:stage" element={<LessonPlayer />} />
      <Route path="/preview" element={<PreviewDashboard />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
