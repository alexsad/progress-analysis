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
import { Fab, Checkbox, List, Divider, ListItem, ListItemText, BottomNavigation, BottomNavigationAction, Tabs, Tab, Paper } from '@material-ui/core';
import { ISkill, ITool } from '../interfaces/i-skill';
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

interface StateTestComponent extends FunctionComponent<IToolsLevel & {toolName:string, index:number, levels:string[], onChange:(level: ELevel, index: number) => void }>{

}

const ExamForm:FunctionComponent<State> & {Test:StateTestComponent} = ({idExam}) => {
    const {exams, save, getSnapshot} = useContext(Exam);
    const [date, setDate] = useState(new Date().getTime());
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
    
    const setTestItem = (toolLevel:ELevel, index: number) => {
        if(toolLevel){
            // #tofix
            setTests(oldtests => {
                if(oldtests[index].level !== toolLevel){
                    oldtests[index].level = toolLevel;
                    return [...oldtests];
                }
                return oldtests;
            });
        }
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

    const levels = (Object.keys(ELevel)).filter((key:any) => typeof ELevel[key] === 'number');

    
    // useEffect(() => {
    //     console.log('test');
    //     if(exam && exam.tests && tests.length === 0 ){
    //         setTests([...exam.tests]);
    //     }
    //     // if(tests.length === 0 && exam && exam.tests && exam.tests.length){
            
    //     // }
    // },[exam, exams, tests]);

    const [selectedSkill, setSelectedSkill] = React.useState(0);
    const icons = ['hearing','chrome_reader_mode','sms','create','book'];

    const skillById = (idSkill:string) => {
        const skill = skills.find((skill) => skill.id === idSkill);
        
        if(typeof skill === 'undefined' || !exam){
            return {
                tools:[],
                id:'',
                name:'',
                description:''
            } as ISkill;
        }

        const snapshot = getSnapshot(exam.id, exams);

        skill.tools.forEach(tool => {
            const level = snapshot[idSkill][tool.id] || ELevel.BREAKTHROUGH; 
            tool.level = level;
        });

        console.log({idSkill, idExam: exam.id, snapshot, skill});

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
                        skills.map((skill, index) => (<Tab key={skill.id} label={skill.name} icon={
                            <Icon color="action" fontSize="small">{icons[index]}</Icon>
                        } />))
                    }
                    {/* <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />

                    <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
                    <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
                    <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} /> */}
                </Tabs>
            </Paper>
            <List>
                {/* <FormControl fullWidth>
                    <TextField type="date" value={dateFormated(date)} label="Date:" onChange={changeDate}/>
                </FormControl> */}
                {/* {
                    tests.map((test, index) => (
                        <ExamForm.Test 
                            onChange={setTestItem}
                            index={index}
                            idSkill={test.idSkill}
                            idTool={test.idTool}
                            level={test.level}
                            key={`${index}_test`}
                            levels={levels}
                        />
                    ))
                } */}

                {
                    skillById(`${selectedSkill+1}`).tools.map((tool, index) => (
                        <ExamForm.Test 
                            onChange={setTestItem}
                            index={index}
                            idSkill={`${selectedSkill+1}`}
                            idTool={tool.id}
                            toolName={toolById(`${selectedSkill+1}`, tool.id).description}
                            level={tool.level || ELevel.BREAKTHROUGH}
                            key={`${index}_test`}
                            levels={levels}
                        />
                    ))
                }

                {/* <Box left="0" right="0" position="absolute" justifyContent="center" alignItems="center" display="flex" style={{bottom:16}}>
                    <Fab size="small" onClick={addTestItem} color="primary" aria-label="Add">
                        <Icon>add</Icon>
                    </Fab>
                </Box> */}
            </List>
        </>
    );
}

const Test:StateTestComponent = ({toolName, levels, index, level, onChange}) => {
    const [selectedLevel, setLevel] = useState(level);

    const handleChangeLevel = ({target}: any) => {
        const value = Number(target.value || selectedLevel);
        if( value && value !== selectedLevel ){
            setLevel(value);
            onChange(value, index);
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

const Body:FunctionComponent<{idExam:string}> = ({idExam}) => {
    return(
        <main>
            <ExamForm idExam={idExam}/>
        </main>
    )
}

ExamAdd.Head = Head;
ExamAdd.Body = Body;

export default ExamAdd;