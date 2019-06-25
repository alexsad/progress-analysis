export enum ELevel{
    BREAKTHROUGH,
    WAYSTAGE,
    THRESHOLD,
    VANTAGE,
    EFFECTIVE,
    MASTERY
}

export interface IToolsLevel{
    idTool:string;
    level:ELevel;
    idSkill:string;
}

export interface IExame{
    id:string;
    date:number;
    tests:IToolsLevel[];
    scores:{
        [idSkill:string]:number;
    };
}