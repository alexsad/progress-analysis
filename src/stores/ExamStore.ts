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
    stage: IExame;
    commit: (exam: IExame) => Promise<boolean>;
    includeExams: (exams: IExame[]) => Promise<boolean>;
    reset: () => Promise<boolean>;
    summarize: (exams: IExame[]) => ISummarize[];
    push: () => Promise<boolean>;
    remove: (idExam: string) => Promise<boolean>;
    getSnapshot: (idExam: string, exams: IExame[]) => IVirtualExam;
}

const useExam = (skills: ISkill[]) => {
    const [exams, setExams] = useState([] as IExame[]);
    const [stage, setStage] = useState({} as IExame);

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
                            prev[id] = 0;
                            if(scores && scores[skill.id]){
                                prev[id] = scores[skill.id];
                            }
                            return prev;
                        }, {} as { [key: string]: number });
                    return { ...examsBySkill, ...skill };
                });
        return data as ISummarize[];
    }

    const includeExams = (pexams: IExame[]) => {
        
        const nexamStr = JSON.stringify([...exams, ...pexams]);

        localStorage.setItem('exams', nexamStr);

        return readData().then(() => {
            reset();
            return Promise.resolve(true);
        });
    };

    const push = () => {
        let nexams = [];
        const examIndex = exams.findIndex(({id}) => stage.id === id);

        if(stage.id && examIndex > -1){
            nexams[examIndex] = stage;
        }else{
            stage.id = `${new Date().getTime()}`;
            nexams = [...exams,...[stage]];
        }

        const nexamStr = JSON.stringify(nexams);

        localStorage.setItem('exams', nexamStr);

        return readData().then(() => {
            reset();
            return Promise.resolve(true);
        });       
    }

    const reset = () => {
        setStage(Object.create({}));
        return Promise.resolve(true);
    }

    const commit = (exam: IExame) => {
        setStage(oldStage => {
            const dateTime = new Date().getTime();
            oldStage.date = oldStage.date  || dateTime;
            oldStage.scores = oldStage.scores || {};
            return {...oldStage, ...exam};
        });
        return Promise.resolve(true);
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
                if(exam.tests){
                     exam
                        .tests
                        .filter((test) => test.idSkill === id).forEach(test => {
                            virtualTests[id][test.idTool] = test.level;
                        });               
                }
            });

            if(idExam === exam.id){
                break;
            }
        }

        return virtualTests;
    }

    const readData = () => {
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
                if(exam.tests){
                    exam
                        .tests
                        .filter((test) => test.idSkill === id).forEach(test => {
                            virtualTests[id][test.idTool] = test.level;
                        });
                }

            });

            skills.forEach(({id, tools}) => {
                const exams1Res = Math
                                    .trunc(
                                        getScoreByIdSkill(tools.length, virtualTests[id])
                                    );
                if(exam.scores){
                    (exam.scores as any)[id] = exams1Res;
                }
            });
        };

       setExams([...data]);
       return Promise.resolve(true);
    }

    useEffect(() => {
        readData();
    }, []);

    return {includeExams, exams, summarize, push, reset, remove, getSnapshot, stage, commit};
}

const Exam = createContext({} as IExamStore);

export { Exam, useExam };
