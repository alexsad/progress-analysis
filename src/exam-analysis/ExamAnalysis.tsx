import React, { FunctionComponent, useContext, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Link, Redirect } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import { Toolbar, Typography, IconButton, Icon, Button, Box } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Exam, useExam } from '../stores/ExamStore';
import { Skill } from '../stores/SkillStore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    iconStyle: {
        color:'#efefef'
    }
  }),
);

const ExamAnalysis: FunctionComponent<{idUser:string}> & { Head: FunctionComponent<{}>, Body: FunctionComponent<{}>} = () => {
    const {skills} = useContext(Skill);

    return (
       <Exam.Provider value={useExam(skills)}>
            <ExamAnalysis.Head/>
            <ExamAnalysis.Body/>
        </Exam.Provider>
    );
}

const Head = () => {
    const classes = useStyles();
    return(
        <AppBar position="fixed" color="inherit">
            <Toolbar>
                <Avatar>
                    <Icon>insert_chart</Icon>
                </Avatar>

                <Typography style={{ flexGrow: 1, color:"#efefef", paddingLeft:"4px"}} variant="subtitle2">
                    My Exam Analysis
                </Typography>

                <IconButton
                    color="default"
                    aria-label="Open drawer"
                    edge="end"
                    to="/exam/add"
                    component={Link}
                >
                    <Icon className={classes.iconStyle}>cloud_download</Icon>
                </IconButton>

                <IconButton
                    color="default"
                    aria-label="Open drawer"
                    edge="end"
                    to={`/qr-code/url/${encodeURIComponent('/exam-analysis')}`}
                    component={Link}
                >
                    <Icon className={classes.iconStyle}>share</Icon>
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}

const Body = () => {
    const [selectedExam, setSelectedExam] = useState('');

    const formatDate = (date:number) => {
        const [year, month, day] = new Date(date).toISOString().substring(0,10).split('-');
        return `${day}/${month}/${year}`;
    }

    const randomColor = () => '#'+Math.floor(Math.random()*16777215).toString(16);

    const legendClick = (even:{dataKey:string}) => {
        // console.log(even.dataKey);
        setSelectedExam(even.dataKey);
    }

    return(
        <main>
            <Container maxWidth="lg">
                <section style={{width:'100%', height:330}}>
                    <Exam.Consumer>
                        {({exams, summarize}) => (
                            <ResponsiveContainer>
                                <RadarChart 
                                    margin={{
                                        top: 100,
                                        right: 30,
                                        left: 0,
                                        bottom: -50,
                                    }} 
                                    outerRadius={120} 
                                    data={summarize(exams)}
                                >
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]}/>
                                    
                                    {exams
                                        .map(({date, id}) => {
                                            const color = randomColor();
                                            return (<Radar key={id} name={`exam ${formatDate(date)}`} dataKey={id} stroke={color} fill={color} fillOpacity={0.6}/>);
                                        })
                                    }

                                    <Legend onClick={legendClick} />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </Exam.Consumer>
                    <Box left="0" right="0" position="absolute" justifyContent="center" alignItems="center" display="flex" style={{bottom:16}}>
                        <Button
                            variant="contained" 
                            to="/exam/add"
                            component={Link}
                            size="small"
                        >
                            <Icon>add</Icon>
                            Lang Exam
                        </Button>
                    </Box>
                </section>
            </Container>

            {!!selectedExam && (<Redirect to={`exam/edit/${selectedExam}`} />)}
        </main>
    )
}

ExamAnalysis.Head = Head;
ExamAnalysis.Body = Body;

export default ExamAnalysis;
