import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RootLayout from "./component/RootLayout";

import Home from "./component/Home";
import Whiteboard from "./component/Whiteboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="board/:shareCode" element={<Whiteboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
