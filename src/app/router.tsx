import { createBrowserRouter } from 'react-router';
import Access from '../pages/Access';
import ClientPage from '../pages/ClientPage';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/access', element: <Access /> },
  { path: '/p/:slug', element: <ClientPage /> },
  { path: '*', element: <NotFound /> },
]);
