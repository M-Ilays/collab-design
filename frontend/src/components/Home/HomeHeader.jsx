import Logo from "../Logo.jsx";
import PrimaryButton from "../../utils/Buttons/PrimaryButton.jsx";
import PropTypes from "prop-types";

const HomeHeader = ({ toggleModal }) => {
  const handleScroll = (event, targetId) => {
    event.preventDefault();
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={
        "bg-gradient-to-r from-primary to-[#667Be6] w-full sticky -top-1 flex justify-between items-center p-4 z-10"
      }
    >
      <Logo className={"pl-2 md:pl-6"} />
      <nav className={"text-white flex items-center ml-auto"}>
        <ul className="md:flex space-x-2 md:space-x-8 pr-8 hidden">
          <li>
            <a
              href={"#Features"}
              onClick={(e) => handleScroll(e, "Features")}
              className="hover:underline"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href={"#FAQ"}
              onClick={(e) => handleScroll(e, "FAQ")}
              className="hover:underline"
            >
              FAQ
            </a>
          </li>
          {/* <li>
                        <a
                            href="#Try"
                            onClick={(e) => handleScroll(e, 'Try')}
                            className="hover:underline"
                        >
                            Try it
                        </a>
                    </li> */}
          <li>
            <a
              href="#Try"
              onClick={(e) => handleScroll(e, "Try")}
              className="hover:underline"
            >
              Forum
            </a>
          </li>
        </ul>
        <PrimaryButton
          text={"Sign in / Sign up"}
          className={"mr-2 md:mr-6"}
          action={toggleModal}
        />
      </nav>
    </div>
  );
};

HomeHeader.propTypes = {
  toggleModal: PropTypes.func.isRequired,
};

export default HomeHeader;
