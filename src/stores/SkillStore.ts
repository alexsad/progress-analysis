import { useState, createContext, useEffect } from 'react';
import { ISkill } from '../interfaces/i-skill';

interface ISkillStore {
    skills: ISkill[];
}

const useSkill = () => {
    const [skills, setSkills] = useState([] as ISkill[]);
    useEffect(() => {
        if (skills.length === 0) {
            fetch('/data/skills.json')
                .then(rs => rs.json())
                .then(data => setSkills([...data]));
        }
    }, [skills]);

    return { skills };
}

const Skill = createContext({} as ISkillStore);

export { Skill, useSkill };