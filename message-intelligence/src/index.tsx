import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes, Link} from 'react-router-dom';
import {Stack} from '@twilio-paste/core/stack';

import App from './App';
import reportWebVitals from './reportWebVitals';
import {IndexPage} from './pages/IndexPage';
import {Loading} from './components/Loading';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Page1 = React.lazy(async () => import('./pages/Page1'));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Page2 = React.lazy(async () => import('./pages/Page2'));

export const Index = (): JSX.Element => {
  return (
    <App>
      <React.Suspense fallback={<Loading />}>
        <BrowserRouter>
          <Routes>
            <Route path="" element={<IndexPage />} />
          </Routes>
        </BrowserRouter>
      </React.Suspense>
    </App>
  );
};

Index.displayName = 'Index';

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>
);

/**
 * If you want to start measuring performance in your app, pass a function
 * to log results (for example: reportWebVitals(console.log))
 * or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
 */
// eslint-disable-next-line no-console
reportWebVitals(console.log);
