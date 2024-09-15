import {Page} from '@strapi/design-system';
import {Switch, Route} from 'react-router-dom';
import Setting from "./Setting";

const App = () => {
  return (
    <Switch>
      <Route path={`/settings/prompt-editor`} component={Setting}/>
      <Route path="*" component={Page.Error}/>
    </Switch>
  );
};

export {App};
