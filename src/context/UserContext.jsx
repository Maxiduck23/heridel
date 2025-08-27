import { createContext, useContext } from 'react';

// Vytvoříme a exportujeme kontext. Může mít výchozí hodnotu null.
export const UserContext = createContext(null);

export const useUser = () => {
    const context = useContext(UserContext);
    // Pojistka, která vyhodí chybu, pokud se hook použije mimo Provider.
    if (!context) {
        throw new Error('useUser musí být použit uvnitř UserProvider');
    }
    return context;
};