import { useState, createContext, useEffect } from 'react';
import { IExame, ELevel } from '../interfaces/i-exame';
import { ISkill } from '../interfaces/i-skill';

interface ISummarize {
    [key: string]: any;
}

interface IExamStore {
    exams: IExame[];
    summarize: (exams: IExame[]) => ISummarize[];
    addExam: (exam: IExame) => Promise<IExame>;
}

const useExam = (skills: ISkill[]) => {
    const [exams, setExams] = useState([] as IExame[]);

    const summarize = (pexams: IExame[]) => {
        const data =
            skills
                .map((skill) => ({
                    id: skill.id,
                    subject: skill.name,
                    fullMark: 100
                }))
                .map((skill) => {
                    const examsBySkill = pexams
                        .reduce((prev, { id, scores }) => {
                            prev[id] = scores[skill.id] | 0;
                            return prev;
                        }, {} as { [key: string]: number });
                    return { ...examsBySkill, ...skill };
                });
        return data as ISummarize[];
    }

    const addExam = (exam: IExame) => {
        const nexams = [...exams,...[exam]];
        localStorage.setItem('exams', JSON.stringify(nexams));
        setExams(nexams);
        return Promise.resolve(exam);
    }

    useEffect(() => {
        if (exams.length === 0) {
            setTimeout(() => {
                
                const data:IExame[] = JSON.parse(localStorage.getItem('exams') || '[]');

                const getScoreByIdSkill = (countTools: number, snapshot:{[key:string]:number}) => {
                    const baseCalc = 100 / countTools;
                    const levelLength = Object.keys(ELevel).length / 2;
                    const score = 
                        Object
                        .keys(snapshot)
                        .reduce((prev, key) => {
                            const levelWeight = snapshot[key] + 1;
                            return ((baseCalc / levelLength) * levelWeight) + prev;
                        }, 0);
                    return score;
                };

                const virtualTests: {
                    [idSkill:string]: {
                        [idTest:string] : ELevel
                    };
                } = {};

                data.forEach((exam) => {
                    skills.forEach(({id}) => {
                        virtualTests[id] = virtualTests[id] || {};
                        exam
                            .tests
                            .filter((test) => test.idSkill === id).forEach(test => {
                                virtualTests[id][test.idTool] = test.level;
                            });
                    });

                    skills.forEach(({id, tools}) => {
                        const exams1Res = Math
                                            .trunc(
                                                getScoreByIdSkill(tools.length, virtualTests[id])
                                            );
                        
                        (exam.scores as any)[id] = exams1Res;
                    });
                });

                data.reverse();

                setExams([...data]);
            }, 2000);
        }
    }, [exams, skills]);

    return { exams, summarize, addExam };
}

const Exam = createContext({} as IExamStore);

export { Exam, useExam };