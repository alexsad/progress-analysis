import { ELevel } from "./i-exame";

export interface ITool{
    id:string;
    description:string;
    level?:ELevel;
}

export interface ISkill{
    id:string;
    name:string;
    description:string;
    tools:ITool[];
}