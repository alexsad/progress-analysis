import { useState, createContext, useEffect } from 'react';
import { IExame, ELevel } from '../interfaces/i-exame';
import { ISkill } from '../interfaces/i-skill';

interface ISummarize {
    [key: string]: any;
}

interface IVirtualExam {
    [idSkill:string]: {
        [idTool:string] : ELevel
    };
}

interface IExamStore {
    exams: IExame[];
    summarize: (exams: IExame[]) => ISummarize[];
    save: (exam: IExame) => Promise<IExame>;
    remove: (idExam: string) => Promise<boolean>;
    getSnapshot: (idExam: string, exams: IExame[]) => IVirtualExam;
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

    const save = (exam: IExame) => {
        let nexams = [];
        if(exam.id){
            const examIndex = exams.findIndex(({id}) => exam.id === id);
            nexams[examIndex] = exam;
        }else{
            exam.id = `${new Date().getTime()}`;
            nexams = [...exams,...[exam]];
        }

        localStorage.setItem('exams', JSON.stringify(nexams));
        setExams(nexams);
        return Promise.resolve(exam);
    }

    const remove = (idExam: string) => {
        const examIndex = exams.findIndex(({id}) => idExam === id);
        exams.splice(examIndex, 1);
        localStorage.setItem('exams', JSON.stringify(exams));
        setExams([...exams]);
        return Promise.resolve(true);
    }

    const getSnapshot = (idExam: string, pexams: IExame[]) => {
        const virtualTests: IVirtualExam = {};

        for(let x = pexams.length - 1; x > -1 ; x-- ){
            const exam = pexams[x];

            skills.forEach(({id}) => {
                virtualTests[id] = virtualTests[id] || {};
                exam
                    .tests
                    .filter((test) => test.idSkill === id).forEach(test => {
                        virtualTests[id][test.idTool] = test.level;
                    });
            });

            if(idExam === exam.id){
                break;
            }
        }

        return virtualTests;
    }

    useEffect(() => {
        if (exams.length === 0) {
            setTimeout(() => {
                const data:IExame[] = JSON.parse(localStorage.getItem('exams') || '[]');

                data.sort((currExam, nextExam) => nextExam.date - currExam.date);
                
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

                const virtualTests: IVirtualExam = {};

                for(let x = data.length - 1; x > -1 ; x-- ){
                    const exam = data[x];

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
                };

                setExams([...data]);
            }, 400);
        }
    }, [exams, skills]);

    return {exams, summarize, save, remove, getSnapshot};
}

const Exam = createContext({} as IExamStore);

export { Exam, useExam };
