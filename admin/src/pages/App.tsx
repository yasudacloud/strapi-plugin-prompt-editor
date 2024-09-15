import {Page} from '@strapi/design-system';
import {Routes, Route} from 'react-router-dom';
import Setting from "./Setting";

const App = () => {
  return (
    <Routes>
      <Route index path={`/settings/prompt-editor`} element={<Setting/>}/>
      <Route path="*" element={<Page.Error/>}/>
    </Routes>
  );
};

export {App};
