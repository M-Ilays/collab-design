import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import Hero from "../components/Home/Hero.jsx";
import Home from "../pages/Home.jsx";
import Auth from "../components/Authentication/Auth.jsx";
import DashboardHeader from "../components/Dashboard/DashboardHeader.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import StatContainer from "../components/Dashboard/StatContainer.jsx";
import ProjectCard from "../components/Dashboard/Projects/ProjectCard.jsx";
import UserAuthFeature from "../components/Project/Requirement/RequirementDetails.jsx";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/Auth">
                <Auth/>
            </ComponentPreview>
            <ComponentPreview path="/Hero">
                <Hero/>
            </ComponentPreview>
            <ComponentPreview path="/Home">
                <Home/>
            </ComponentPreview>
            <ComponentPreview path="/DashboardHeader">
                <DashboardHeader/>
            </ComponentPreview>
            <ComponentPreview path="/Dashboard">
                <Dashboard/>
            </ComponentPreview>
            <ComponentPreview path="/StatContainer">
                <StatContainer/>
            </ComponentPreview>
            <ComponentPreview path="/ProjectCard">
                <ProjectCard/>
            </ComponentPreview>
            <ComponentPreview path="/UserAuthFeature">
                <UserAuthFeature/>
            </ComponentPreview>

        </Previews>
    )
}

export default ComponentPreviews