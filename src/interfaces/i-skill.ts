export interface ITool{
    id:string;
    description:string;
}

export interface ISkill{
    id:string;
    name:string;
    description:string;
    tools:ITool[];
}