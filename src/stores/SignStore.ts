import { useState, createContext, useEffect } from 'react';

interface ISignStore {
    idUser:string;
}

const useSign = () => {
    const [idUser, setIdUser] = useState('');
    useEffect(() => {
       setTimeout(() => setIdUser('uid'),2000);
    },[]);

    return { idUser };
}

const Sign = createContext({} as ISignStore);

export {Sign, useSign};
