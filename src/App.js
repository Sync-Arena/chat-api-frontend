import logo from "./logo.svg";
import "./App.css";
import {Route, Routes} from "react-router-dom"
import Home from "./Pages/Home.js"
import Chats from "./Pages/Chats.js"
import {BrowserRouter} from "react-router-dom"

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Home} exact/>
          <Route path="/chats" Component={Chats} />
        </Routes>
      </BrowserRouter>    
    </div>
  );
}

export default App;
