import React, { FunctionComponent, useState, useContext, useEffect, ReactComponentElement } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import { IExame, ELevel, IToolsLevel } from '../interfaces/i-exame';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { Fab } from '@material-ui/core';
import { ISkill } from '../interfaces/i-skill';
import Avatar from '@material-ui/core/Avatar';
import { Link, Redirect } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import { Toolbar, Typography, IconButton, Icon, Button, Box } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Exam, useExam } from '../stores/ExamStore';
import { Skill } from '../stores/SkillStore';
import LinkUI from '@material-ui/core/Link';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    selectEmpty: {
      marginTop: 16,
    },
    iconStyle: {
        color:'#efefef'
    }
  }),
);


const ExamAdd: FunctionComponent<{idExam:string}> & { Head: FunctionComponent<{idExam:string}>, Body: FunctionComponent<{idExam:string}>} = ({idExam}) => {
    const {skills} = useContext(Skill);

    return (
       <Exam.Provider value={useExam(skills)}>
            <ExamAdd.Head idExam={idExam}/>
            <ExamAdd.Body idExam={idExam}/>
        </Exam.Provider>
    );
}


const Head:FunctionComponent<{idExam:string}> = ({idExam}) => {
    const [redirect, setRedirect] = useState(false);
    const classes = useStyles();
    const {exams, remove} = useContext(Exam);

    const exam = exams.find(({id}) => idExam === id);
    
    const dateFormated = (pdate:number) => {
        const [year, month, day] = new Date(pdate).toISOString().substring(0,10).split('-');
        return `${year}-${month}-${day}`;
    };

    const wrapperRemove = () => {
        remove(idExam);
        setRedirect(true);
    }

    return(
        <AppBar position="fixed" color="inherit">
            <Toolbar>
                <LinkUI style={{marginRight:"4px"}} component={Link} to="/">
                    <Icon className={classes.iconStyle}>keyboard_backspace</Icon>
                </LinkUI>

                <Avatar>
                    <Icon>insert_chart</Icon>
                </Avatar>

                {!!exam && (
                    <Typography style={{ flexGrow: 1, color:"#efefef", paddingLeft:"4px"}} variant="subtitle2">
                        Exam of {dateFormated(exam.date)}
                    </Typography>
                )}

                <IconButton
                    color="default"
                    aria-label="Open drawer"
                    edge="end"
                    onClick={wrapperRemove}
                >
                    <Icon className={classes.iconStyle}>delete_forever</Icon>
                </IconButton>

                <IconButton
                    color="default"
                    aria-label="Open drawer"
                    edge="end"
                    to={`/qr-code/url/${encodeURIComponent('/exam-analysis')}`}
                    component={Link}
                >
                    <Icon className={classes.iconStyle}>done</Icon>
                </IconButton>

                {redirect && <Redirect to="/" />}

            </Toolbar>
        </AppBar>
    )
}

interface State{
    idExam?:string;
}

interface StateExam{
    idSkill:string;
    idTool:string;
    level:ELevel;
}

interface StateTestComponent extends FunctionComponent<IToolsLevel & {index:number, onDelete:(index:number) => void, onChange:(toolLevel: IToolsLevel, index: number) => void }>{

}

const ExamForm:FunctionComponent<State> & {Test:StateTestComponent} = ({idExam}) => {
    const {exams, save} = useContext(Exam);
    const [date, setDate] = useState(new Date().getTime());
    const [redirect, setRedirect] = useState(false);
        
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
        console.log(index);
        setTests(oldtests => {
            oldtests.splice(index,1);
            return [...oldtests];
        });
    }

    const addExamWrapper = () => {
        if(tests.length){
            save({
                id:idExam as string,
                date,
                tests:tests,
                scores:{}
            }).then(() => {
                setRedirect(true);
            });
        }
    }

    const exam = exams.find(({id}) => idExam === id) as IExame;
    
    const [tests, setTests] = useState([] as IToolsLevel[]);

    
    useEffect(() => {
        console.log('test');
        if(exam && tests.length === 0){
            setTests([...exam.tests]);
        }
        // if(tests.length === 0 && exam && exam.tests && exam.tests.length){
            
        // }
    },[exam, exams, tests]);

    return (
        <form>
            {/* <FormControl fullWidth>
                <TextField type="date" value={dateFormated(date)} label="Date:" onChange={changeDate}/>
            </FormControl> */}
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
            <Box left="0" right="0" position="absolute" justifyContent="center" alignItems="center" display="flex" style={{bottom:16}}>
                <Fab size="small" onClick={addTestItem} color="primary" aria-label="Add">
                    <Icon>add</Icon>
                </Fab>
            </Box>
        </form>
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
        <Box width="98%" style={{marginTop:10}} display="flex" flexGrow="initial">
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

const Body:FunctionComponent<{idExam:string}> = ({idExam}) => {
    return(
        <main>
            <Container maxWidth="lg">
                <section style={{marginTop:80}}>
                    <ExamForm idExam={idExam}/>
                </section>
            </Container>
        </main>
    )
}

ExamAdd.Head = Head;
ExamAdd.Body = Body;

export default ExamAdd;