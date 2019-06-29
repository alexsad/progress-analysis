import React, { FunctionComponent, useState, useContext, useEffect } from 'react';
import { IExame, ELevel, IToolsLevel } from '../interfaces/i-exame';
import { Checkbox, List, Divider, ListItem, Tabs, Tab, Paper } from '@material-ui/core';
import { ISkill, ITool } from '../interfaces/i-skill';
import Avatar from '@material-ui/core/Avatar';
import { Link, Redirect } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import { Toolbar, Typography, IconButton, Icon, Box } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Exam, useExam } from '../stores/ExamStore';
import { Skill } from '../stores/SkillStore';
import LinkUI from '@material-ui/core/Link';

interface State{
    idExam?:string;
}

interface StateExam{
    idSkill:string;
    idTool:string;
    level:ELevel;
}

interface StateTestComponent extends FunctionComponent<IToolsLevel & {toolName:string, levels:string[], onChange:(level: ELevel, idSkill:string, idTool:string ) => void }>{};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    selectEmpty: {
      marginTop: 16,
    },
    iconStyle: {
        color:'#efefef'
    },
    headInput: {
        color: 'inherit',
        backgroundColor: 'transparent',
        border: 0,
        fontSize: 'inherit',
        fontWeight: 'inherit',
    }
  }),
);

const ExamAdd: FunctionComponent<{idExam:string}> & { Head: FunctionComponent<{idExam:string}>} = ({idExam}) => {
    const {skills} = useContext(Skill);

    return (
       <Exam.Provider value={useExam(skills)}>
            <ExamAdd.Head idExam={idExam}/>
            <main>
                <ExamForm idExam={idExam}/>
            </main>
        </Exam.Provider>
    );
}


const Head:FunctionComponent<{idExam:string}> = ({idExam}) => {
    const [redirect, setRedirect] = useState(false);
    const classes = useStyles();
    const {exams, remove, commit, reset, push, stage} = useContext(Exam);

    // console.log('size:',exams.length);

    useEffect(() => {
/*
        console.log('head:mount2',{
            stage,
            idExam,
            stageId:stage.id,
            typeIdEXAM:typeof idExam,
            verificationA:typeof idExam === 'undefined',
            verificationB:!!stage.id,
            verificationC:stage.id !== idExam,
            typeSTAGEID:typeof stage.id,
        });
*/
        if(typeof idExam === 'undefined' && !!stage.id){
            //console.log('a');
            
            commit({
                id:`${new Date().getTime()}`,
                tests: [] as IToolsLevel[],
            } as IExame);
            
        }else if(!!idExam && stage.id !== idExam){
            // console.log('b');
            const exam = exams.find(({id}) => idExam === id) || {} as IExame;
            // console.log('c', {exams,exam});
            commit(exam);
        }
        return () => {
            reset();
        };
    }, [exams]);
/*
    console.log('head:render',{
        idExam,
        stage,
        typeIdEXAM:typeof idExam,
        verificationA:typeof idExam === 'undefined',
        verificationC:stage.id !== idExam,
        typeSTAGEID:typeof stage.id,
     });
*/   
    const dateFormated = (pdate:number) => {
        const [year, month, day] = new Date(pdate).toISOString().substring(0,10).split('-');
        return `${year}-${month}-${day}`;
    };

    const wrapperRemove = () => {
        remove(idExam);
        reset();
        setRedirect(true);
    };

    const wrapperSave = () => {
        // console.log(idExam,JSON.stringify(stage));
        push()
            .then(() => setRedirect(true));
    }

    const changeDate = ({target:{value}}: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = value.split('-');
        let dateValue = new Date(Number(year), Number( month ) - 1, Number(day)).getTime();
        commit({date:dateValue} as IExame);
    };

    return(
        <AppBar position="fixed" color="inherit">
            <Toolbar>
                <LinkUI style={{marginRight:"4px"}} component={Link} to="/">
                    <Icon className={classes.iconStyle}>keyboard_backspace</Icon>
                </LinkUI>

                <Avatar>
                    <Icon>insert_chart</Icon>
                </Avatar>

                {!!stage && (
                    <Typography style={{ flexGrow: 1, color:"#efefef", paddingLeft:"4px"}} variant="subtitle2">
                        Exam of
                        <input className={classes.headInput} type="date" value={dateFormated(stage.date || new Date().getTime())} onChange={changeDate}/>
                    </Typography>
                )}

                {!!idExam && (
                    <IconButton
                        color="default"
                        aria-label="Open drawer"
                        edge="end"
                        onClick={wrapperRemove}
                    >
                        <Icon className={classes.iconStyle}>delete_forever</Icon>
                    </IconButton>
                )}


                <IconButton
                    color="default"
                    aria-label="Open drawer"
                    edge="end"
                    onClick={wrapperSave}
                >
                    <Icon 
                        className={classes.iconStyle} 
                    >done</Icon>
                </IconButton>

                {redirect && <Redirect to="/" />}

            </Toolbar>
        </AppBar>
    )
}

const ExamForm:FunctionComponent<State> & {Test:StateTestComponent} = ({idExam}) => {
    const {exams, exams:{length:examCount}, commit, getSnapshot, stage} = useContext(Exam);
    const {skills} = useContext(Skill);
    const [selectedSkill, setSelectedSkill] = React.useState(0);
    const icons = ['hearing','chrome_reader_mode','sms','create','book'];
    
    const setTestItem = (toolLevel:ELevel, idSkill:string, idTool:string) => {
        //console.log({toolLevel, stage});
        const {tests = []} = stage;
        if(toolLevel){
            const testIndex = tests.findIndex(test => test.idTool === idTool);
            //console.log(testIndex);
            if(testIndex > -1 && tests[testIndex].level !== toolLevel){
                tests[testIndex].level = toolLevel;
                commit({tests: [...tests]} as IExame);
            }else{
                commit({tests: [...tests,...[{
                    idTool,
                    idSkill,
                    level:toolLevel,
                }]]} as IExame);
            }
        }
    }
    
    const levels = (Object.keys(ELevel)).filter((key:any) => typeof ELevel[key] === 'number');

    const skillById = (idSkill:string) => {
        const skill = skills.find((skill) => skill.id === idSkill);
        // console.log(JSON.stringify(stage));
        if(typeof skill === 'undefined' || !stage){
            return {
                tools:[],
                id:'',
                name:'',
                description:''
            } as ISkill;
        }

        const snapshot = getSnapshot(stage.id, exams);
        
        skill.tools.forEach(tool => {
            const test = stage.tests ? stage.tests.find(exam => exam.idSkill === idSkill && exam.idTool === tool.id) : null;
            let level = ELevel.BREAKTHROUGH;
            if(test){
                level = test.level;
            }else if(snapshot[idSkill] && snapshot[idSkill][tool.id]){
                level = snapshot[idSkill][tool.id];
            }
            tool.level = level;
        });
        // console.log({idSkill,skill:JSON.stringify(skill),snapshot:JSON.stringify(snapshot)});
        return skill as unknown as ISkill;
    }

    const toolById = (idSkill:string, idTool:string) => {
        const skill = skills.find((skill) => skill.id === idSkill) || { tools:[] };
        return skill.tools.find(tool => tool.id === idTool) || {} as ITool;
    };

    return (
        <>
            <Paper square style={{flexGrow:1}}>
                <Tabs
                    value={selectedSkill}
                    onChange={(event, newValue) => {
                        if(newValue !== selectedSkill){
                            setSelectedSkill(newValue);
                        }
                    }}
                    color="inherit"
                    variant="fullWidth"
                    centered
                >
                    {
                        skills.map((skill, index) => (
                            <Tab 
                                key={skill.id} 
                                label={skill.name}
                                icon={
                                    <Icon color="action" fontSize="small">{icons[index]}</Icon>
                                } 
                            />))
                    }
                </Tabs>
            </Paper>
            <List>
                {
                    skillById(`${selectedSkill+1}`).tools.map((tool, index) => (
                        <ExamForm.Test 
                            onChange={setTestItem}
                            idSkill={`${selectedSkill+1}`}
                            idTool={tool.id}
                            toolName={toolById(`${selectedSkill+1}`, tool.id).description}
                            level={tool.level as ELevel}
                            key={`${tool.id}_${examCount}_test`}
                            levels={levels}
                        />
                    ))
                }
            </List>
        </>
    );
}

const Test:StateTestComponent = ({toolName, levels, level, onChange, idSkill, idTool}) => {
    const [selectedLevel, setLevel] = useState(level);

    const handleChangeLevel = ({target}: any) => {
        const value = Number(target.value || selectedLevel);
        if( value && value !== selectedLevel ){
            setLevel(value);
            onChange(value, idSkill, idTool);
        }
    };

    return (
        <>
            <ListItem alignItems="flex-start">
                <Box display="flex" flexDirection="row" flexGrow={1} flexWrap="wrap">
                    <Typography style={{ width: '100%' }}>
                        {toolName}
                    </Typography>                        
                    {levels.map(
                        (level, index) => (
                            <Checkbox
                                key={`_${index}`}
                                title={level}
                                icon={
                                    <Icon color="action" fontSize="small">star_border</Icon>
                                } 
                                checkedIcon={
                                    <Icon style={{color:'#ea9f1d'}} fontSize="small">star</Icon>
                                }
                                checked={index <= selectedLevel}
                                value={index}
                                onChange={handleChangeLevel}
                            />
                        )
                    )}
                    <Typography variant="overline" color="textSecondary" style={{ width: '100%' }}>
                        {ELevel[selectedLevel]}
                    </Typography>
                </Box>
            </ListItem>
            <Divider variant="fullWidth" component="li" />
        </>
    );
}

ExamForm.Test = Test;
ExamAdd.Head = Head;

export default ExamAdd;
