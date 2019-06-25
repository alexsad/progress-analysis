import React, { FunctionComponent, useState, useContext, useEffect } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import { Link, Redirect } from "react-router-dom";
import { IExame, ELevel, IToolsLevel } from '../interfaces/i-exame';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { Box, Theme, createStyles, Icon, Fab } from '@material-ui/core';
import { Skill } from '../stores/SkillStore';
import { ISkill } from '../interfaces/i-skill';
import { makeStyles } from '@material-ui/styles';
import { Exam, useExam } from '../stores/ExamStore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    selectEmpty: {
      marginTop: 16,
    },
  }),
);

interface State extends IExame{
    redirect?:boolean;
}

interface StateExam{
    idSkill:string;
    idTool:string;
    level:ELevel;
}

interface StateTestComponent extends FunctionComponent<IToolsLevel & {index:number, onDelete:(index:number) => void, onChange:(toolLevel: IToolsLevel, index: number) => void }>{

}

const ExamForm:FunctionComponent<State> & {Test:StateTestComponent} = () => {

    const [date, setDate] = useState(new Date().getTime());
    const [tests, setTests] = useState([] as IToolsLevel[]);
    const [redirect, setRedirect] = useState(false);
    const {skills} = useContext(Skill);
        
    const changeDate = ({target:{value}}: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = value.split('-');
        setDate(new Date(Number(year), Number( month ) - 1, Number(day)).getTime());
    };

    const dateFormated = (pdate:number) => {
        const [year, month, day] = new Date(pdate).toISOString().substring(0,10).split('-');
        return `${year}-${month}-${day}`;
    };

    const addTestItem = () => {
        setTests(oldtests => {
            return [...oldtests, ...[
                {
                    idSkill:'',
                    idTool:'',
                    level: ELevel.BREAKTHROUGH
                }
            ]];
        });
    }
    
    const setTestItem = (toolLevel:IToolsLevel, index: number) => {
        if(toolLevel.idSkill && toolLevel.idTool){
            setTests(oldtests => {
                oldtests[index] = {...toolLevel};
                return [...oldtests];
            });
        }
    }

    const delTestItem = (index:number) => {
        setTests(oldtests => {
            oldtests.splice(index,1);
            return [...oldtests];
        });
    }

    const addExamWrapper = (addExam:(exam:IExame)=>Promise<IExame>) => () => {
        if(tests.length){
            addExam({
                id:`${new Date().getTime()}`,
                date,
                tests:tests,
                scores:{}
            }).then(() => {
                setRedirect(true);
            });
        }
    }

    return (
        <Exam.Provider value={useExam(skills)}>
            <Exam.Consumer>
                {({addExam}) => (
                    <Dialog fullScreen typeof="" aria-labelledby="form-dialog-title" open>
                        <DialogTitle id="simple-dialog-title">Create a new exam</DialogTitle>
                        <DialogContent>
                            <form>
                                <FormControl fullWidth>
                                    <TextField type="date" value={dateFormated(date)} label="Date:" onChange={changeDate}/>
                                </FormControl>
                                {
                                    tests.map((test, index) => (
                                        <ExamForm.Test 
                                            onChange={setTestItem} 
                                            onDelete={delTestItem} 
                                            index={index} 
                                            idSkill={test.idSkill} 
                                            idTool={test.idTool} 
                                            level={test.level} 
                                            key={`${index}_test`}
                                        />
                                    ))
                                }
                                <FormControl fullWidth style={{marginTop:10}}>
                                    <Fab onClick={addTestItem} color="primary" aria-label="Add">
                                        <Icon>add</Icon>
                                    </Fab>
                                </FormControl>
                            </form>
                        </DialogContent>
                        <DialogActions>
                            <Button disabled={!tests.length} onClick={addExamWrapper(addExam)}>
                                Add
                            </Button>
                            <Link className="MuiButtonBase-root MuiButton-root MuiButton-text" to="/">
                                Cancel
                            </Link>
                        </DialogActions>
                        {redirect && (<Redirect to="/"></Redirect>)}
                    </Dialog>
                )}
            </Exam.Consumer>
        </Exam.Provider>
    );
}

const Test:StateTestComponent = ({index,idSkill, level, idTool, onDelete, onChange}) => {
    const classes = useStyles();

    const {skills} = useContext(Skill);

    const [state, setState] = useState({idSkill, idTool, level} as StateExam);

    const handleChange = (name: keyof StateExam) => (event: any) => {
        if(event.target && event.target.value){
            const props = {[name]: event.target.value} as any;
    
            setState(oldprops => ({...oldprops, ...props}));
        }
    };

    const skillById = (idSkill:string) => {
        const skill = skills.find((skill) => skill.id === idSkill);
        
        if(typeof skill === 'undefined'){
            return {
                tools:[],
                id:'',
                name:'',
                description:''
            } as ISkill;
        }
        return skill as unknown as ISkill;
    }

    useEffect(() => {
        if(state.idSkill !== idSkill || state.idTool !== idTool || state.level !== level){
            onChange(state, index);
        }
    },[index, state, onChange, idSkill, level, idTool]);

    return (
        <Box style={{width:'100%', marginTop:10}} display="flex" flexGrow="initial">
            <FormControl style={{flex:.5}}>
                <InputLabel htmlFor="skillid">Skill</InputLabel>
                <Select
                    inputProps={{
                        name: 'skill',
                        id: 'skillid',
                    }}
                    value={state.idSkill}
                    onChange={handleChange('idSkill')}
                    className={classes.selectEmpty}
                >
                    {skills.map(
                        (skill, index) => (<MenuItem key={`${skill.id}_${index}`} value={skill.id}>{skill.name}</MenuItem>)
                    )}
                </Select>
            </FormControl>
            <FormControl style={{flex:1}}>
                <InputLabel htmlFor="toolid">Tool</InputLabel>
                <Select
                    inputProps={{
                        name: 'tool',
                        id: 'toolid',
                    }}
                    value={state.idTool || ' '}
                    onChange={handleChange('idTool')}
                    disabled={!state.idSkill}
                    className={classes.selectEmpty}
                >
                    {skillById(state.idSkill).tools.map(
                        (tool, index) => (<MenuItem key={`${tool.id}_${index}`} value={tool.id}>{tool.description}</MenuItem>)
                    )}
                </Select>
            </FormControl>
            <FormControl style={{flex:.5}}>
                <InputLabel htmlFor="levelid">Level</InputLabel>
                <Select
                    inputProps={{
                        name: 'level',
                        id: 'levelid',
                    }}
                    value={state.level}
                    onChange={handleChange('level')}
                    className={classes.selectEmpty}
                >
                    {(Object.keys(ELevel)).filter((key:any) => typeof ELevel[key] === 'number').map(
                        (level, index) => (<MenuItem key={`_${index}`} value={index}>{level}</MenuItem>)
                    )}
                </Select>
            </FormControl>
            <FormControl style={{flex:.0, marginTop:10}}>
                <Icon onClick={() => onDelete(index)}>
                    delete_outline
                </Icon>
            </FormControl>
        </Box>
    );
}

ExamForm.Test = Test;

export default ExamForm;