import PrimaryButton from "../../utils/Buttons/PrimaryButton.jsx";
import bg from '../../assets/bg.jpg'
import PropTypes from "prop-types";

const Hero = ({toggleModal}) => {
    const moto= "Collaborate, Design, Succeed";
    const subtitle = "Facilitate collaborative diagramming and requirements management in one seamless experience.";
    return (
        <section className="relative bg-cover bg-center md:h-[70dvh] h-[40dvh] text-white" style={{ backgroundImage: `url(${bg})` }}>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="md:text-4xl text-2xl font-bold">{moto}</h1>
                    <p className="mt-4">{subtitle}</p>
                    <div className={"flex justify-center"}>
                    <PrimaryButton className={"mt-6 md:px-6 py-3 md:text-lg"} text={"Get Started"} action={toggleModal}/>
                    </div>
                </div>
            </div>

        </section>
    );
};

Hero.propTypes = {
    toggleModal : PropTypes.func.isRequired
}
export default Hero;
