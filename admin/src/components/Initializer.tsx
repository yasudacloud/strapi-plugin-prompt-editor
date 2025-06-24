import { useEffect } from 'react';

import { PLUGIN_ID } from '../pluginId';

type InitializerProps = {
  setPlugin: (id: string) => void;
};

const Initializer = ({ setPlugin }: InitializerProps) => {
  useEffect(() => {
    setPlugin(PLUGIN_ID);
  }, []);

  return null;
};

export { Initializer };
