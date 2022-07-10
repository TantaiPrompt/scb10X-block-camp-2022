import "./App.css";
import { useState } from "react";
import Header from "./components/Header";
import Body from "./components/Body";

function App() {
  const [myAccounts, setMyAccounts] = useState(null);
  const [modal, setModal] = useState("myAccountModal");
  return (
    <div className="font-Montserrat">
      <Header
        myAccounts={myAccounts}
        setMyAccounts={setMyAccounts}
        modal={modal}
        setModal={setModal}
      />
      <Body
        myAccounts={myAccounts}
        setMyAccounts={setMyAccounts}
        modal={modal}
        setModal={setModal}
      />
    </div>
  );
}

export default App;
