import 'react-app-polyfill/ie11'
import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'

import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider, Route} from 'react-router-dom'



import App from './pages/backup/App';
import Main from './pages/main'


import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />
  },
  {
    path: "/main",
    element: <App />
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);
