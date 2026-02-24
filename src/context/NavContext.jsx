import { createContext, useContext } from 'react';

const NavContext = createContext({ isSecondaryNavPage: false });

export const NavProvider = NavContext.Provider;

export const useNavContext = () => useContext(NavContext);
