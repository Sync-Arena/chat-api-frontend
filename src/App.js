import logo from "./logo.svg";
import "./App.css";
import {Route, Routes} from "react-router-dom"
import Home from "./Pages/Home.js"
import ChatPage from "./Pages/ChatPage.js"
import ChatProvider from "./Context/ChatProvider";
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
        <ChatProvider>
          <Routes>
            <Route path="/" Component={Home} exact/>
            <Route path="/chats" Component={ChatPage} />
          </Routes>
        </ChatProvider>
      </BrowserRouter>    
    </div>
  );
}

export default App;
