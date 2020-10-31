import './App.css';
import ChatWindow from './components/chatBox/chatWindow';
import AdminWindow from './components/chatBox/adminWindow';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path='/'>
            <ChatWindow />
          </Route>
          <Route path='/admin'>
            <AdminWindow />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
