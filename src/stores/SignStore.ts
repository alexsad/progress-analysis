import { useState, createContext, useEffect } from 'react';

interface ISignStore {
    idUser:string;
}

const useSign = () => {
    const [idUser, setIdUser] = useState('');
    useEffect(() => {
       setTimeout(() => setIdUser('uid'), 800);
    },[]);

    return { idUser };
}

const Sign = createContext({} as ISignStore);

export {Sign, useSign};
