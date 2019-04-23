import mixpanel from "mixpanel-browser";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
/* tslint:disable-next-line:no-import-side-effect no-submodule-imports
 * Disabling this two rules is necessary for
 * allowing the import of default styles that ReactToastify needs
 * to display properly even if some of them are overridden later
 */
import "react-toastify/dist/ReactToastify.min.css";
import { Preloader } from "./components/Preloader";
import Dashboard from "./scenes/Dashboard";
import store from "./store/index";

const app: React.SFC = (): JSX.Element => (
  <React.StrictMode>
    <BrowserRouter basename={"/integrates/dashboard#!"}>
      <React.Fragment>
        <Provider store={store}>
          <React.Fragment>
            <Switch>
              <Route path="/home" exact={true} component={Dashboard} />
              <Route path="/project" component={Dashboard} />
              <Route path="/forms" component={Dashboard} />
            </Switch>
            <Preloader />
          </React.Fragment>
        </Provider>
      </React.Fragment>
    </BrowserRouter>
    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={true} closeOnClick={false} />
  </React.StrictMode>
);

mixpanel.init("7a7ceb75ff1eed29f976310933d1cc3e");
ReactDOM.render(React.createElement(app), document.getElementById("root"));