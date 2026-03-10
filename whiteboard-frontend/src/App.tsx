import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RootLayout from "./component/RootLayout";
import Whiteboard from "./component/WhiteBoard";
import Home from "./component/Home";

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
