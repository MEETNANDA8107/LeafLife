import { JSDOM } from 'jsdom';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import App from './src/App.jsx';
import { AuthProvider } from './src/contexts/AuthContext.jsx';
import { UserProvider } from './src/contexts/UserContext.jsx';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  url: "http://localhost:5173/"
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

try {
  const html = renderToString(
    <AuthProvider>
      <UserProvider>
        <StaticRouter location="/">
          <App />
        </StaticRouter>
      </UserProvider>
    </AuthProvider>
  );
  console.log("RENDER SUCCESS!");
  console.log(html.substring(0, 200) + '...');
} catch (err) {
  console.error("RENDER FAILED:", err);
}
