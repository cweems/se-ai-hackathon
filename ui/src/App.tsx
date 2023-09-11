import * as React from 'react';
import {Theme} from '@twilio-paste/core/theme';
import { Type } from 'typescript';

const App: React.FC<any> = ({children}) => {
  return <Theme.Provider theme="default">{children}</Theme.Provider>;
};

App.displayName = 'App';

export default App;
