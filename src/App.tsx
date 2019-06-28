import React from 'react';
import './App.scss';
import { HashRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import CssBaseline from '@material-ui/core/CssBaseline';
import {Sign, useSign} from './stores/SignStore';
import LinearProgress from '@material-ui/core/LinearProgress';
import QRCode from './qrcode/QRCode';
import UserProfile from './user-profile/UserProfile';
import ExamAnalysis from './exam-analysis/ExamAnalysis';
import ExamAdd from './exam/ExamAdd';
import { Skill, useSkill } from './stores/SkillStore';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <div className="App">
        <Skill.Provider value={useSkill()}>
          <Sign.Provider value={useSign()}>
            <Sign.Consumer>
              {({idUser}) => (
                <>
                {!!idUser ? (
                    <Router>
                      <Switch>
                        <Route path="/" exact render={() => <Redirect to="/exam-analysis"/>} />
                        <Route path="/user-profile" exact render={() => <UserProfile idUser={idUser} />} />
                        <Route path="/exam-analysis" exact render={() => <ExamAnalysis idUser={idUser} />} />
                        <Route path="/qr-code/url/:url" render={({match:{params}}) => <QRCode url={`${decodeURIComponent(params.url)}`} />} />
                        <Route path="/exam/add" component={ExamAdd} />
                        <Route path="/exam/edit/:id" render={({match:{params}}) => <ExamAdd idExam={params.id} />} />
                      </Switch>
                    </Router>  
                ) : (
                  <LinearProgress />
                )}
                </>
              )}
            </Sign.Consumer>
        </Sign.Provider>
        </Skill.Provider>
      </div>
    </>
  );
}

export default App;
