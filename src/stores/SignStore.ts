import { useState, createContext, useEffect } from 'react';

interface ISignStore {
    idUser:string;
}

const useSign = () => {
    const [idUser, setIdUser] = useState('');
    useEffect(() => {
        if(!idUser){
            setTimeout(() => setIdUser('uid'),2000);
        }
    },[idUser]);

    return { idUser };
}

const Sign = createContext({} as ISignStore);

export {Sign, useSign};